"use server";

import { AppError, PlainAppError } from "@/errors";
import { MonthlyCategoryDetails } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Updates the assigned amount for a category in a monthly budget
export async function updateAssigned(
  monthlyBudgetId: number,
  categoryId: number,
  newAmount: number,
): Promise<null | PlainAppError> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
    }).toPlainObject();
  }

  if (isNaN(newAmount) || newAmount < 0) {
    return new AppError({
      name: "VALIDATION_ERROR",
      message: "Assigned amount must be a positive number",
    }).toPlainObject();
  }

  // Query the database to get the current amount, for use in calculating
  // the monthly available budget
  const { data: currentDetails, error: fetchError } = await supabase
    .from("monthly_category_details")
    .select("amount_assigned")
    .eq("monthly_budget_id", monthlyBudgetId);

  if (fetchError) {
    console.error("Error fetching current amount: ", fetchError);
    return new AppError({
      name: "DB_ERROR",
      message: fetchError?.message || "Error fetching current amount",
      code: fetchError?.code || "UNKNOWN_ERROR",
    }).toPlainObject();
  }
  
  // Use the old amount to update the monthly available budget
  const oldAmount = currentDetails[0]?.amount_assigned || 0;

  const { error: upsertError } = await supabase
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
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}

export async function getMonthlyCategoryDetails(
  monthlyBudgetId: number,
): Promise<MonthlyCategoryDetails[] | PlainAppError> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
