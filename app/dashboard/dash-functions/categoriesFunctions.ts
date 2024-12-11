// Fetch the JOINed table of our categories and their monthly details
// Inputs:
// budgetId - the ID of the budget to fetch categories for (number)
//
// Output: an array of CategoryWithDetails objects or an Error

import { AppError, PlainAppError } from "@/errors";
import { CategoryGroup, CategoryWithDetails } from "@/types";
import { createClient } from "@/utils/supabase/server";

// categoryWithDetails - an array of Category objects with a nested MonthlyCategoryDetails object
export async function getCategoriesWithDetails(
  budgetId: number,
  monthlyBudgetID: number,
): Promise<CategoryWithDetails[] | PlainAppError> {
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

  await new Promise((resolve) => setTimeout(resolve, 1000));

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
    .eq("budget_id", budgetId)
    .eq("monthly_category_details.monthly_budget_id", monthlyBudgetID);

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


export async function getCategoryGroups(
  budgetId: number,
): Promise<CategoryGroup[] | PlainAppError> {
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
      code: authError?.code,
      status: authError?.status,
    }).toPlainObject();
  }

  const { data, error } = await supabase
    .from("category_groups")
    .select("*")
    .eq("budget_id", budgetId)
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Error fetching category groups: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
    }).toPlainObject();
  }

  return data;
}
