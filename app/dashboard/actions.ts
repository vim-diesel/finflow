"use server";
import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Database, Tables } from "@/database.types";

type Budget = Tables<"budgets">;
type MonthlyBudget = Tables<"monthly_budgets">;
type Category = Tables<"categories">;
type MonthlyCategoryDetails = Tables<"monthly_category_details">;

// Define a type that represents the structure of the data returned from getCategoriesWithDetails
type CategoryWithDetails = Category & {
  monthly_category_details: MonthlyCategoryDetails;
};

// Server Action to fetch transactions
export async function getDefaultBudget(): Promise<Budget | null> {
  const supabase = createClientServer();

  const { data: budgets, error } = await supabase.from("budgets").select("*");

  if (error || !budgets) {
    console.error("Error fetching budgets:", error);
    return null;
  }

  revalidatePath("/dashboard");
  return budgets[0];
}

// Server Action to fetch the current monthly budget
export async function getCurrMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | null> {
  const supabase = createClientServer();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  // Ensure the dates are in UTC
  const firstDayOfMonthUTC = new Date(
    Date.UTC(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      firstDayOfMonth.getDate(),
    ),
  );
  const firstDayOfNextMonthUTC = new Date(
    Date.UTC(
      firstDayOfNextMonth.getFullYear(),
      firstDayOfNextMonth.getMonth(),
      firstDayOfNextMonth.getDate(),
    ),
  );

  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .gte("month", firstDayOfMonthUTC.toISOString())
    .lt("month", firstDayOfNextMonthUTC.toISOString());

  if (error) {
    console.error("Error fetching monthly budgets:", error);
    return null;
  }

  revalidatePath("/dashboard");
  return monthlyBudget[0];
}

// Fetch the JOINed table of our categories and their monthly details
export async function getCategoriesWithDetails(currMonthlyBudgetID: number): Promise<CategoryWithDetails[] | null> {
  const supabase = createClientServer();
  const { data: catsWithDeets, error } = await supabase
    .from("categories")
    .select(
      `
    *,
    monthly_category_details (
      *
    )
  `,
    )
    .eq("monthly_category_details.monthly_budget_id", currMonthlyBudgetID);

  if (error || !catsWithDeets) {
    console.error("Error fetching catories with details:", error);
    return null;
  }
  // Map over the data to flatten `monthly_category_details` to a single object
  const flattenedData = catsWithDeets.map((category) => ({
    ...category,
    monthly_category_details: category.monthly_category_details[0] || null, // Get the first detail or set to null
  }));

  revalidatePath("/dashboard");
  return flattenedData;
}
