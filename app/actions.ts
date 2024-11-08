"use server";
import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Budget,
  MonthlyBudget,
  CategoryWithDetails,
  CategoryGroup,
  Transaction,
  Category,
} from "./types";
import { PostgrestError } from "@supabase/supabase-js";

// Server Action to fetch transactions
export async function getDefaultBudget(): Promise<Budget | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const { data: budgets, error } = await supabase.from("budgets").select("*");

  if (error || !budgets) {
    console.error("Error fetching budgets: ", error);
    return error;
  }

  revalidatePath("/dashboard");
  return budgets[0];
}

// Server Action to fetch the current monthly budget
export async function getCurrMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  // // Ensure the dates are in UTC
  // const firstDayOfMonthUTC = new Date(
  //   Date.UTC(
  //     firstDayOfMonth.getFullYear(),
  //     firstDayOfMonth.getMonth(),
  //     firstDayOfMonth.getDate(),
  //   ),
  // );
  // const firstDayOfNextMonthUTC = new Date(
  //   Date.UTC(
  //     firstDayOfNextMonth.getFullYear(),
  //     firstDayOfNextMonth.getMonth(),
  //     firstDayOfNextMonth.getDate(),
  //   ),
  // );

  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .gte("month", firstDayOfMonth.toISOString())
    .lt("month", firstDayOfNextMonth.toISOString())
    .limit(1)
    .single();

  //Let our Server Component do that error handling, so it can decide to still
  // render the page or not.
  if (error) {
    console.error("Error fetching current monthly budgets: ", error);
    return error;
  }

  revalidatePath("/dashboard");
  return monthlyBudget;
}

// Fetch the JOINed table of our categories and their monthly details
// Inputs: 
// budgetId - the ID of the budget to fetch categories for (number) 
// 
// Output: an array of CategoryWithDetails objects or an Error
// categoryWithDetails - an array of Category objects with a nested MonthlyCategoryDetails object
export async function getCategoriesWithDetails(
  currMonthlyBudgetID: number,
): Promise<CategoryWithDetails[] | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const { data: categoriesWithDetails, error } = await supabase
    .from("categories")
    .select(
      `
    *,
    monthly_category_details!inner (*)
  `,
    )
    .eq("monthly_category_details.monthly_budget_id", currMonthlyBudgetID);

  if (error || !categoriesWithDetails) {
    console.error("Error fetching catories with details:", error);
    return error;
  }

  // Map over the data to flatten `monthly_category_details` to a single object
  const flattenedData = categoriesWithDetails.map((category) => ({
    ...category,
    monthly_category_details: category.monthly_category_details[0] || null, // Get the first detail or set to null
  }));

  revalidatePath("/dashboard");
  return flattenedData;
}

export async function getCategoryGroups(
  budgetId: number,
): Promise<CategoryGroup[] | Error> {
  const supabase = createClientServer();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const { data, error } = await supabase
    .from("category_groups")
    .select("*")
    .eq("budget_id", budgetId);

  if (error || !data) {
    console.error("Error fetching category groups: ", error);
    return error;
  }

  return data;
}

/* User can add a transaction row. 

Date Handling: use only the date part of the ISO string to match 
schema's timestamp without time zone.

We don't return the data inserted into the table, just null.

*/
export async function addTransaction(
  budgetId: number,
  amount: number,
  transactionType: "inflow" | "outflow",
  category?: Category,
  date?: Date,
  memo?: string,
  cleared?: boolean,
  payee?: string,
): Promise<null | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  if (amount < 0) {
    return Error("Transaction amount must be non-negative");
  }

  if (transactionType !== "inflow" && transactionType !== "outflow") {
    return Error("Invalid transaction type");
  }

  const { error } = await supabase.from("transactions").insert({
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

  if (error) {
    console.error("Error inserting transaction: ", error);
    return error;
  }

  return null;
}

export async function getTransactions(budgetId: number): Promise<Transaction[] | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId);

  if (error || !data) {
    console.error("Error fetching transactions: ", error);
    return error;
  }

  return data;
}

export async function updateAssigned(budgetId: number, monthlyBudgetId: number, categoryId: number, assigned: number): Promise<null | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  if (assigned < 0) {
    return Error("Assigned amount must be non-negative");
  }

  const { error } = await supabase
    .from("monthly_category_details")
    .update({amount_assigned: assigned})
    .eq("monthly_budget_id", monthlyBudgetId)
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error updating assigned amount: ", error);
    return error;
  }

  return null;
}

export async function getMonthlyAvailable(monthlyBudgetId: number): Promise<number | Error> {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("available")
    .eq("monthly_budget_id", monthlyBudgetId);

  if (error || !data) {
    console.error("Error fetching monthly available: ", error);
    return error;
  }

  const totalAssigned = data.reduce((acc: number, curr: { available: number | null }) => {
    if (curr.available === null) {
      return acc;
    }
    return acc + curr.available;
  }, 0);

  return totalAssigned;
}

export async function getAvailableAmount(budgetId: number, currMonth: Date) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }
}