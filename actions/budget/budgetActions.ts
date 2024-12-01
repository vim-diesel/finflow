"use server";

import { AppError, PlainAppError } from "@/errors";
import { Budget } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDefaultBudget(
  budgetName: string,
): Promise<Budget | PlainAppError> {
  const supabase = await createClient();
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
