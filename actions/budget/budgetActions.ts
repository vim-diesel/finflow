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
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code || "AUTH_FAILURE",
      status: authError?.status || 401,
      hint: { hint: "Try logging in again." },
    }).toPlainObject();
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
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  return budget;
}

export async function createDefaultBudget(budgetName: string): Promise<Budget | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code || "AUTH_FAILURE",
      status: authError?.status || 401,
      hint: { hint: "Try logging in again." },
    }).toPlainObject();
  }

  const { data: newBudget, error } = await supabase
    .from("budgets")
    .insert([{ name: budgetName, user_id: user.id }])
    .single();

  if (error) {
    console.error("Error creating default budget: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  // Revalidate the path to ensure the new budget is reflected in the UI
  revalidatePath("/dashboard");

  return newBudget;
}