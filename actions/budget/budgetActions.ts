"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyBudget, Budget } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


export async function getDefaultBudget(): Promise<Budget | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Return our custom error type if there is an auth error from Supabase
  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    ).toPlainObject();
  }

  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  // If there is an error, return our custom error type
  if (error) {
    // If no budget is found, create a default budget.
    // This also is true if multiple budgets are found and single() is called,
    // but we used a limit of 1, so that shouldn't happen.
    if (error.code === "PGRST116") {
      const budgetName = `${user.email}'s Budget`;
      return await createDefaultBudget(budgetName);
    }
    console.error("Error fetching budgets: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  // revalidatePath("/dashboard");
  return budget;
}

export async function createDefaultBudget(
  name: string = "My Budget",
): Promise<Budget | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    ).toPlainObject();
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  return data;
}