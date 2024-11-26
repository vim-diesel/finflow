"use server";

import { AppError, PlainAppError } from "@/errors";
import { CategoryWithDetails } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Fetch the JOINed table of our categories and their monthly details
// Inputs:
// budgetId - the ID of the budget to fetch categories for (number)
//
// Output: an array of CategoryWithDetails objects or an Error
// categoryWithDetails - an array of Category objects with a nested MonthlyCategoryDetails object
export async function getCategoriesWithDetails(
  monthlyBudgetID: number,
): Promise<CategoryWithDetails[] | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { data: categoriesWithDetails, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      monthly_category_details (
        *
      )
    `,
    )
    .eq("monthly_category_details.monthly_budget_id", monthlyBudgetID)

  if (error || !categoriesWithDetails) {
    console.error("Error fetching categories with details: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
  }

  // Map over the data to flatten `monthly_category_details` to a single object
  const flattenedData = categoriesWithDetails.map((category) => ({
    ...category,
    monthly_category_details: category.monthly_category_details[0] || null, // Get the first detail or set to null
  }));

  // revalidatePath("/dashboard");
  // Sort the flattened data so that the highest ids appear first
  const sortedData = flattenedData.sort((a, b) => a.id - b.id);
  return sortedData;
}

// Add a new category to the categories table
// Inputs:
// categoryName - the name of the category to add (string)
//
// Output: the new category object or an Error
export async function addCategory(
  categoryName: string,
  groupId: number,
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { error } = await supabase
    .from("categories")
    .insert([{ name: categoryName, user_id: user.id, group_id: groupId }]);

  if (error) {
    console.error("Error adding category: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
    }).toPlainObject();
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