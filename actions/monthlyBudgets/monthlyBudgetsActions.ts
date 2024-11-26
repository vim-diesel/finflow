"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyBudget } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 
// Server Action to fetch the current monthly budget (current: time at which this is called)
// Inputs:
// budgetId - the ID of the budget to fetch the current monthly budget for (number)
//
// Output: the current monthly budget or an Error
// monthlyBudget - the current monthly budget (Today)
// TODO: Run calculations to update the total available amount upon user login
export async function getTodaysMonthlyBudget(
  budgetId: number,
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

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Convert the date to UTC and format as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth)
    .toISOString()
    .split("T")[0];

  // Fetch the current monthly budget
  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", firstDayOfMonthUTC)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no monthly budget found
      // create a monthly budget for the current month
      // TODO: and calculate available amount
      return createMonthlyBudget(budgetId, new Date());
    }
    console.error("Error fetching current monthly budgets: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  // revalidatePath("/dashboard");
  return monthlyBudget;
}


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