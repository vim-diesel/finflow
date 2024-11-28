"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyCategoryDetails } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Updates the assigned amount for a category in a monthly budget
export async function updateAssigned(
  monthlyBudgetId: number,
  categoryId: number,
  oldAmount: number,
  newAmount: number,
): Promise<MonthlyCategoryDetails | PlainAppError> {
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
      code: authError?.code,
      status: authError?.status,
    }).toPlainObject();
  }

  if (newAmount < 0) {
    return new AppError({
      name: "VALIDATION_ERROR",
      message: "Assigned amount must be non-negative",
    }).toPlainObject();
  }

  if (isNaN(newAmount) || newAmount < 0) {
    return new AppError({
      name: "VALIDATION_ERROR",
      message: "Assigned amount must be a positive number",
    }).toPlainObject();
  }

  const { data: upsertData, error: upsertError } = await supabase
    .from("monthly_category_details")
    .upsert(
      {
        user_id: user.id,
        monthly_budget_id: monthlyBudgetId,
        category_id: categoryId,
        amount_assigned: newAmount,
      },
      { onConflict: "monthly_budget_id,category_id" },
    )
    .select()
    .single();

  if (upsertError) {
    console.error("Error upserting assigned amount: ", upsertError);
    return new AppError({
      name: "DB_ERROR",
      message: upsertError.message,
      code: upsertError.code,
      status: 500,
      details: upsertError.details,
      hint: {
        attemptedUpsert: {
          user_id: user.id,
          monthly_budget_id: monthlyBudgetId,
          category_id: categoryId,
          amount_assigned: newAmount,
        },
      },
    }).toPlainObject();
  }

  // Update the monthly_available amount in the monthly_budgets table
  // by the difference between the old and new amounts
  const amountDiff = oldAmount - newAmount;
  const { error: updateError } = await supabase.rpc(
    "update_monthly_available",
    {
      p_monthly_budget_id: monthlyBudgetId,
      p_amount: amountDiff,
    },
  );

  if (updateError) {
    console.error(
      "Error updating monthly_available when assignign to category: ",
      updateError,
    );
    return new AppError({
      name: "DB_ERROR",
      message: updateError.message,
      code: updateError.code,
      status: 500,
      details: updateError.details,
      hint: {
        attemptedUpdate: {
          monthlyBudgetId,
          amountDiff,
        },
        category: {
          categoryId,
        },
      },
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return upsertData;
}

export async function getMonthlyCategoryDetails(
  monthlyBudgetId: number,
): Promise<MonthlyCategoryDetails[] | PlainAppError> {
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

  const { data: details, error } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("monthly_budget_id", monthlyBudgetId);

  if (error) {
    console.error("Error fetching monthly category details: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  return details;
}

export async function createMonthlyCategoryDetails(
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
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code,
    }).toPlainObject();
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
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  if (!data) {
    return new AppError({
      name: "NOT_FOUND",
      message: "No data returned",
    }).toPlainObject();
  }

  return data[0];
}
