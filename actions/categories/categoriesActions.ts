"use server";

import { AppError, isPlainAppError, PlainAppError } from "@/errors";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createMonthlyCategoryDetails } from "../monthlyCategoryDetails";

interface CategoryGoalUpdate {
  target_amount?: number;
  frequency?: "monthly" | "weekly" | "yearly" | "custom";
  due_day?: number;
  repeat_interval?: number;
  repeat_unit?: "day" | "week" | "month" | "year";
  repeat_on?: boolean;
  snoozed?: boolean;
  due_date?: string;
}

// Add a new category to the categories table
// Inputs:
// categoryName - the name of the category to add (string)
//
// Output: the new category object or an Error
export async function addCategory(
  monthlyBudgetId: number,
  categoryName: string,
  groupId: number,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { data: categoryData, error } = await supabase
    .from("categories")
    .insert([{ name: categoryName, user_id: user.id, group_id: groupId }])
    .select("*")
    .single();

  if (error) {
    console.error("Error adding category: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  const categoryDetailsRow = await createMonthlyCategoryDetails(
    categoryData.id,
    monthlyBudgetId,
  );

  if (isPlainAppError(categoryDetailsRow)) {
    console.error(
      "Error creating monthly category details while adding new category: ",
      categoryDetailsRow.error.message,
    );
    return categoryDetailsRow;
  }

  revalidatePath("/dashboard");
  return null;
}

// Update the name of an existing category
// Inputs:
// categoryId - the ID of the category to update (number)
// newCategoryName - the new name of the category (string)
//
// Output: null or an Error
export async function updateCategoryName(
  categoryId: number,
  newCategoryName: string,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { error } = await supabase
    .from("categories")
    .update({ name: newCategoryName })
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .select("*");

  if (error) {
    console.error("Error updating category name: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}

// Delete an existing category
// Inputs:
// categoryId - the ID of the category to delete (number)
//
// Output: null or an Error
export async function deleteCategory(
  categoryId: number,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .match({ id: categoryId, user_id: user.id });

  if (error) {
    console.error("Error deleting category: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}

// Update the monthly goal of an existing category
// Inputs:
// categoryId - the ID of the category to update (number)
// newMonthlyGoal - the new monthly goal value (number)
//
// Output: null or an Error
export async function updateMonthlyGoal(
  categoryId: number,
  goalAmount?: number,
  frequency?: "monthly" | "weekly" | "yearly" | "custom",
  dueDay?: number,
  repeatInterval?: number,
  repeatUnit?: "day" | "week" | "month" | "year",
  repeatOn?: boolean,
  snoozed?: boolean,
  dueDate?: Date,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const updateData: CategoryGoalUpdate = {};
  if (goalAmount !== undefined) updateData.target_amount = goalAmount;
  if (frequency !== undefined) updateData.frequency = frequency;
  if (dueDay !== undefined) updateData.due_day = dueDay;
  if (repeatInterval !== undefined) updateData.repeat_interval = repeatInterval;
  if (repeatUnit !== undefined) updateData.repeat_unit = repeatUnit;
  if (repeatOn !== undefined) updateData.repeat_on = repeatOn;
  if (snoozed !== undefined) updateData.snoozed = snoozed;
  if (dueDate !== undefined) updateData.due_date = new Date(
    Date.UTC(
      dueDate.getUTCFullYear(),
      dueDate.getUTCMonth(),
      dueDate.getUTCDate(),
      0, 0, 0, 0
    )
  ).toISOString();

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .select("*");

  if (error) {
    console.error("Error updating monthly goal: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}
