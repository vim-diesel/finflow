"use server";
import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Budget,
  MonthlyBudget,
  CategoryWithDetails,
  CategoryGroup,
  Transaction,
  TransactionTypeEnum,
  Category,
} from "./types";
import { PostgrestError } from "@supabase/supabase-js";

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
): Promise<MonthlyBudget | PostgrestError> {
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
    .eq("budget_id", budgetId)
    .gte("month", firstDayOfMonthUTC.toISOString())
    .lt("month", firstDayOfNextMonthUTC.toISOString());

  //Let our Server Component do that error handling, so it can decide to still
  // render the page or not.
  if (error) {
    console.error("Error fetching monthly budgets:", error);
    return error;
  }

  revalidatePath("/dashboard");
  return monthlyBudget[0];
}

// Fetch the JOINed table of our categories and their monthly details
export async function getCategoriesWithDetails(
  currMonthlyBudgetID: number,
): Promise<CategoryWithDetails[] | null> {
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

export async function getCategoryGroups(
  budgetId: number,
): Promise<CategoryGroup[] | null> {
  const supabase = createClientServer();
  const { data, error } = await supabase
    .from("category_groups")
    .select("*")
    .eq("budget_id", budgetId);

  if (error || !data) {
    console.error("Error fetching category groups: ", error);
    return null;
  }

  return data;
}

/* User can add a transaction row. 

Date Handling: use only the date part of the ISO string to match 
schema's timestamp without time zone.

*/
export async function addTransaction(
  budgetId: number,
  amount: number,
  transactionType: TransactionTypeEnum,
  category?: Category,
  date?: Date,
  memo?: string,
  cleared?: boolean,
  payee?: string,
): Promise<Transaction | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return new Error("Cannot find user");
  }

  if (amount < 0) {
    return new Error("Transaction amount must be non-negative");
  }

  if (transactionType !== "inflow" && transactionType !== "outflow") {
    return new Error("Invalid transaction type");
  }

  const { data, error } = await supabase.from("transactions").insert({
    budget_id: budgetId,
    user_id: user.id,
    amount,
    transaction_type: transactionType,
    category_id: category?.id,
    date: date
      ? date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    memo: memo || "",
    cleared: cleared || true,
    payee: payee || null,
  });

  if (error || !data) {
    console.error("Error inserting transaction: ", error);
    return new Error(error?.message || "Failed to insert transaction");
  }

  return data as Transaction;
}
