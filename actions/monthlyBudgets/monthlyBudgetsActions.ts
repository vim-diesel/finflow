"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyBudget } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


// creates a new monthly budget for the given month
export async function createMonthlyBudget(
  budgetId: number,
  month: Date,
): Promise<MonthlyBudget | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code,
    }).toPlainObject();
  }

  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  // Format date as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("monthly_budgets")
    .insert([
      { user_id: user.id, budget_id: budgetId, month: firstDayOfMonthUTC },
    ])
    .select()
    .single();

  if (error || !data) {
    console.error("Error fetching monthly budgets: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  return data;
}

// Add/subtract form the available amount in the monthly_budgets table
export async function updateAvailableAmount(
  monthlyBudgetId: number,
  amount: number,
): Promise<null | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code,
    }).toPlainObject();
  }

  const { error } = await supabase.rpc("update_monthly_available", {
    p_monthly_budget_id: monthlyBudgetId,
    p_amount: amount,
  });

  if (error) {
    console.error("Error updating available amount: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  revalidatePath("/dashboard/debug");
  return null;
}
