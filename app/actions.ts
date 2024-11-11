"use server";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Budget,
  MonthlyBudget,
  CategoryWithDetails,
  CategoryGroup,
  Transaction,
} from "./types";

// I kind of like the idea of returning null instead of an Error if no rows are found.
// It's not really an error, just no data. We can handle that in the component.

/************************************************************
getCurrMonthlyBudget needs tests for:
Valid date range queries
No budget found for date range
Multiple budgets found error

getCategoriesWithDetails needs tests for:
Successful flattening of nested data
Empty categories array
Invalid join query

getCategoryGroups needs tests for:
Successful fetch
No groups found
Auth failure
Database error

getAvailableAmount needs additional tests for:
Complex calculation scenarios
Different transaction types
Edge cases with dates
************************************************************/

// Server Action to fetch the default budget of the user

/*
If the user has no budget, we need to assume it never got created or was deleted. 
If we are calling this function, we need to create one. We will just do it for them.
But we will do it where we called the server action, and create another server 
action to create a new budget.
*/
export async function getDefaultBudget(): Promise<Budget | Error> {
  // Boilerplate code to create a Supabase client
  // (basically configure a new fetch call)
  // must be done anytime you wish to call auth.getUser()
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return Error(authError.message);
  }

  // Make sure this picks the first budget (lowest budgetId)
  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching budgets: ", error);
    return Error(error.message);
  }

  revalidatePath("/dashboard");
  return budget;
}

// Server Action to fetch the current monthly budget (current: time at which this is called)
// Inputs:
// budgetId - the ID of the budget to fetch the current monthly budget for (number)
//
// Output: the current monthly budget or an Error
// monthlyBudget - the current monthly budget (Today) or an Error
export async function getCurrMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | Error> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Error fetching user: ", authError);
    return Error(authError.message);
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  // Do we need to use UTC dates here? I think we should be fine with local dates

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
    return Error(error.message);
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
  const supabase = createServersideClient();
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
    return Error(error?.message || "Error fetching categories with details");
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
  const supabase = createServersideClient();

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

// Inputs:
// budgetId - the ID of the budget to add the transaction to (number)
// amount - the amount of the transaction (number)
// transactionType - the type of transaction (string)
// category - the ID of the category of the transaction (number)
// date - the date of the transaction (Date)
// memo - the memo of the transaction (string)
// cleared - whether the transaction is cleared (boolean)
// payee - the payee of the transaction (string)
//
// Output: null or an Error

export async function addTransaction(
  budgetId: number,
  amount: number,
  transactionType: "inflow" | "outflow",
  categoryId?: number,
  date?: Date,
  memo?: string,
  cleared?: boolean,
  payee?: string,
): Promise<null | Error> {
  const supabase = createServersideClient();
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
    category_id: categoryId || null,
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

export async function getTransactions(
  budgetId: number,
): Promise<Transaction[] | Error> {
  const supabase = createServersideClient();
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

// Updates the assigned amount for a category in a monthly budget
export async function updateAssigned(
  monthlyBudgetId: number,
  categoryId: number,
  amountAssigned: number,
): Promise<null | Error> {
  const supabase = createServersideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  if (amountAssigned < 0) {
    return Error("Assigned amount must be non-negative");
  }

  const { error } = await supabase
    .from("monthly_category_details")
    .update({ amount_assigned: amountAssigned })
    .eq("monthly_budget_id", monthlyBudgetId)
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error updating assigned amount: ", error);
    return error;
  }

  return null;
}

// export async function getMonthlyAvailable(
//   monthlyBudgetId: number,
// ): Promise<number | Error> {
//   const supabase = createServersideClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user?.id) {
//     return Error("User authentication failed or user not found");
//   }

//   const { data, error } = await supabase
//     .from("monthly_budgets")
//     .select("available")
//     .eq("monthly_budget_id", monthlyBudgetId);

//   if (error || !data) {
//     console.error("Error fetching monthly available: ", error);
//     return error;
//   }

//   const totalAssigned = data.reduce(
//     (acc: number, curr: { available: number | null }) => {
//       if (curr.available === null) {
//         return acc;
//       }
//       return acc + curr.available;
//     },
//     0,
//   );

//   return totalAssigned;
// }

// Fetch the available amount for the current month
// Inputs:
// budgetId - the ID of the budget to fetch the available amount for (number)
// currMonth - the current month (Date)
//
// Output: the available amount (number) or an Error
// availableAmount - the total available amount for the current month
// or an Error
// or null, which it probably doesn't have to. We can remove this
export async function getAvailableAmount(
  budgetId: number,
  currMonth: Date,
): Promise<number | null | Error> {
  const supabase = createServersideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Error("User authentication failed or user not found");
  }

  // Validate currMonth
  if (!(currMonth instanceof Date) || isNaN(currMonth.getTime())) {
    return Error("Invalid date provided");
  }

  // Get all transactions up to the current month
  // we are checking for userId and BudgetID
  // but I think at this point, if the user is on the dashboard and we know their
  // budgetId, we can just get all transactions for that budgetId without checking
  // the userId. We should have already checked that the user is authenticated.
  // RLS is on so they can only see their own data, anyway.

  // To display this months current Available amount, we need all transactions
  // from this month and all previous months.
  let { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", user.id)
    .lte("date", currMonth.toISOString())
    .order("date", { ascending: true });

  if (transactionsError || !transactions) {
    console.error("Error fetching transactions: ", transactionsError);
    return transactionsError;
  }

  // Get all monthly budgets up to the current month
  const { data: monthlyBudgets, error: bugdetsError } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", user.id)
    .lte("month", currMonth.toISOString())
    .order("month", { ascending: true });

  if (bugdetsError || !monthlyBudgets) {
    console.error("Error fetching monthly budgets: ", bugdetsError);
    return bugdetsError;
  }

  // Get all monthly category details up to the current month
  const { data: monthlyCategoryDetails, error: categoryError } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("user_id", user.id)
    .lte(
      "monthly_budget_id",
      monthlyBudgets?.[monthlyBudgets.length - 1]?.id || 0,
    )
    .order("monthly_budget_id", { ascending: true });

  if (categoryError || !monthlyCategoryDetails) {
    console.error("Error fetching monthly category details: ", categoryError);
    return categoryError;
  }

  //  We'll sum up all previous inflow transactions, subtract the amount
  // assigned to all categories, and subtract previous uncategorized outflow.
  // This will give us the available amount for the current month.

  // Total inflow
  const totalInflow = transactions
    .filter((t) => t.transaction_type === "inflow")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total assigned
  const totalAssigned = monthlyCategoryDetails.reduce(
    (acc, curr) => acc + Number(curr.amount_assigned),
    0,
  );

  // total uncategorized outflow
  const totalUncategorizedOutflow = transactions
    .filter((t) => t.transaction_type === "outflow" && !t.category_id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate available amount
  const availableAmount =
    totalInflow - totalAssigned - totalUncategorizedOutflow;

  return availableAmount;
}

export async function createDefaultBudget(
  name: string = "My Budget",
): Promise<Budget | Error> {
  const supabase = createServersideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return new Error("User authentication failed or user not found");
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget: ", error);
    return error;
  }

  return data;
}
