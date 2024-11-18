"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyCategoryDetails } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";

// Updates the assigned amount for a category in a monthly budget
export async function updateAssigned(
  monthlyBudgetId: number,
  categoryId: number,
  amountAssigned: number,
): Promise<null | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    ).toPlainObject();
  }

  if (amountAssigned < 0) {
    return new AppError(
      "VALIDATION_ERROR",
      "Assigned amount must be non-negative",
    ).toPlainObject();
  }

  const { error } = await supabase
    .from("monthly_category_details")
    .update({ amount_assigned: amountAssigned })
    .eq("monthly_budget_id", monthlyBudgetId)
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error updating assigned amount: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  return null;
}


export async function getMonthlyCategoryDetails(
  budgetId: number,
  month: string,
): Promise<MonthlyCategoryDetails[] | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    ).toPlainObject();
  }

  const { data: details, error } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", month);

  if (error) {
    console.error("Error fetching monthly category details: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  return details;
}