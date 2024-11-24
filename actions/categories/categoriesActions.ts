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
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    ).toPlainObject();
  }

  const { data: categoriesWithDetails, error } = await supabase
    .from("categories")
    .select(`
      *,
      monthly_category_details (
        *
      )
      `)

  if (error || !categoriesWithDetails) {
    console.error("Error fetching catories with details: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  // Map over the data to flatten `monthly_category_details` to a single object
  const flattenedData = categoriesWithDetails.map((category) => ({
    ...category,
    monthly_category_details: category.monthly_category_details[0] || null, // Get the first detail or set to null
  }));

  // revalidatePath("/dashboard");
  return flattenedData;
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
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    ).toPlainObject();
  }

  const { error } = await supabase
    .from("categories")
    .insert([{ name: categoryName, user_id: user.id, group_id: groupId }]);

  if (error) {
    console.error("Error adding category: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}

// Update a category in the categories table

