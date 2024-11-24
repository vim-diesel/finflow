"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyCategoryDetails } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

  const { data: updateData, error: updateError } = await supabase
    .from("monthly_category_details")
    .upsert(
      {
        user_id: user.id,
        monthly_budget_id: monthlyBudgetId,
        category_id: categoryId,
        amount_assigned: amountAssigned,
      },
      { onConflict: "monthly_budget_id,category_id" }, // Specify the conflict target
    );

  if (updateError) {
    console.error("Error updating assigned amount: ", updateError);
    return new AppError(
      "DB_ERROR",
      updateError.message,
      updateError.code,
    ).toPlainObject();
  }

  revalidatePath("/dashboard");
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

export async function createMonthlyCategoryDetails(
  budgetId: number,
  categoryId: number,
  monthlyBudgetId: number,
): Promise<MonthlyCategoryDetails | PlainAppError> {
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

  const { data, error } = await supabase
    .from("monthly_category_details")
    .insert([
      {
        category_id: categoryId,
        monthly_budget_id: monthlyBudgetId,
        user_id: user.id,
      },
    ]);

  if (error) {
    console.error("Error creating monthly category details: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  if (!data) {
    return new AppError("NOT_FOUND", "No data returned").toPlainObject();
  }

  return data[0];
}
