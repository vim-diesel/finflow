"use server";
import { createServersideClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Budget,
  MonthlyBudget,
  CategoryWithDetails,
  CategoryGroup,
  Transaction,
  MonthlyCategoryDetails,
} from "./types";
import { AppError } from "./errors";
import App from "next/app";

// I kind of like the idea of returning null instead of an Error if no rows are found.
// It's not really an error, just no data. We can handle that in the component.

/************************************************************
getCurrMonthlyBudget needs tests for:
Valid date range queries
No budget found for date range
Multiple budgets found error

addTransaction needs tests for:
Valid transaction types
Invalid transaction types
Negative amounts
Invalid dates
Invalid category

getCategoriesWithDetails needs tests for:
Successful flattening of nested data
Empty categories array
Invalid join query

getCategoryGroups needs tests for:
Successful fetch
No groups found

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
export async function getDefaultBudget(): Promise<Budget | AppError> {
  // Boilerplate code to create a Supabase client
  // (basically configure a new fetch call)
  // must be done anytime you wish to call auth.getUser()
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Return our custom error type if there is an auth error from supabase
  if (authError) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    );
  }

  // Seperately checking for a missing user (this is probably unecessary)
  // TODO: Remove this if we are confident that authError will always be thrown
  if (!user) {
    console.error("User not found");
    return new AppError("AUTH_ERROR", "User not found");
  }

  // Picks the first budget (lowest budget ID) for the user
  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  // If there is an error, return our custom error type
  if (error) {
    // If no budget is found, create a default budget.
    // This also is true if multiple budgets are found and single() is called,
    // but we used a limit of 1, so that shouldn't happen.
    if (error.code === "PGRST116") {
      const budgetName = `${user.email}'s Budget`;
      return createDefaultBudget(budgetName);
    }
    console.error("Error fetching budgets: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  revalidatePath("/dashboard");
  return budget;
}

// Server Action to fetch the current monthly budget (current: time at which this is called)
// Inputs:
// budgetId - the ID of the budget to fetch the current monthly budget for (number)
//
// Output: the current monthly budget or an Error
// monthlyBudget - the current monthly budget (Today)
// TODO: store Month as an int: 202411. Divide by 100 for year, %100 for month. Sortable and comparable.
// TODO: Run calculations to update the total available amount upon user login
//
export async function getCurrMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | AppError> {
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
    );
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Convert the date to UTC and format as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth).toISOString().split('T')[0];

  // Fetch the current monthly budget
  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", firstDayOfMonthUTC)
    .limit(1)
    .single();

  // Let our Server Component do that error handling, so it can decide to still
  // render the page or not. Or it can create one.
  if (error) {
    if (error.code === "PGRST116") {
      // create a monthly budget and calculate available amount
      return createMonthlyBudget(budgetId);
    }
    console.error("Error fetching current monthly budgets: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
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
  monthlyBudgetID: number,
): Promise<CategoryWithDetails[] | AppError> {
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
    );
  }

  const { data: categoriesWithDetails, error } = await supabase
    .from("categories")
    .select(
      `
    *,
    monthly_category_details!inner (*)
  `,
    )
    .eq("monthly_category_details.monthly_budget_id", monthlyBudgetID);

  if (error || !categoriesWithDetails) {
    console.error("Error fetching catories with details:", error);
    return new AppError("PG_ERROR", error.message, error.code);
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
): Promise<CategoryGroup[] | AppError> {
  const supabase = createServersideClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    );
  }

  const { data, error } = await supabase
    .from("category_groups")
    .select("*")
    .eq("budget_id", budgetId);

  if (error || !data) {
    console.error("Error fetching category groups: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
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
// note - the memo of the transaction (string)
// cleared - whether the transaction is cleared (boolean)
// payee - the payee of the transaction (string) (this will be its own table in the future)
//
// Output: null or an Error

export async function addTransaction(
  budgetId: number,
  amount: number,
  transactionType: "inflow" | "outflow",
  categoryId?: number,
  date?: Date,
  note?: string,
  cleared?: boolean,
  payee?: string,
): Promise<null | AppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    );
  }

  if (amount < 0) {
    return new AppError("ERROR", "Transaction amount must be non-negative");
  }

  if (transactionType !== "inflow" && transactionType !== "outflow") {
    return new AppError("ERROR", "Invalid transaction type");
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
    note: note || "",
    cleared: cleared || true,
    payee: payee || null,
  });

  if (error) {
    console.error("Error inserting transaction: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  revalidatePath("/dashboard");
  return null;
}

export async function getTransactions(
  budgetId: number,
): Promise<Transaction[] | AppError> {
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
    );
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  revalidatePath("/dashboard");
  return transactions;
}

// Updates the assigned amount for a category in a monthly budget
export async function updateAssigned(
  monthlyBudgetId: number,
  categoryId: number,
  amountAssigned: number,
): Promise<null | AppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    );
  }

  if (amountAssigned < 0) {
    return new AppError("ERROR", "Assigned amount must be non-negative");
  }

  const { error } = await supabase
    .from("monthly_category_details")
    .update({ amount_assigned: amountAssigned })
    .eq("monthly_budget_id", monthlyBudgetId)
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error updating assigned amount: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  return null;
}

// TODO: If there are no rows from the query, we should return null instead of continuing with empty arrays.
// Fetch the available amount for the given month
// Inputs:
// budgetId - the ID of the budget to fetch the available amount for (number)
// currMonth - the current month (Date)
//
// Output: the available amount (number) or an Error
// availableAmount - the total available amount for the current month
// or an Error
// or null, which it probably doesn't have to. We can remove this if it doesn't get used.
export async function getAvailableAmount(
  budgetId: number,
  month: Date,
): Promise<number | null | AppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    );
  }

  // Validate currMonth
  if (!(month instanceof Date) || isNaN(month.getTime())) {
    return new AppError("ERROR", "Invalid date provided");
  }

  // Get all transactions up to the current month
  // we are checking for userId and BudgetID
  // but I think at this point, if the user is on the dashboard and we know their
  // budgetId, we can just get all transactions for that budgetId without checking
  // the userId. We should have already checked that the user is authenticated.
  // RLS is on so they can only see their own data, anyway.

  // To display this months current Available amount, we need all transactions
  // from this month and all previous months.
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", user.id)
    .lte("date", month.toISOString())
    .order("date", { ascending: true });

  // Pretty sure if there are no transactions then Supabase just throws an error,
  // making the second if statement redundant.
  // TODO: Check if this is true and remove the second if statement.
  if (transactionsError) {
    console.error("Error fetching transactions: ", transactionsError);
    return new AppError(
      "PG_ERROR",
      transactionsError?.message,
      transactionsError?.code,
    );
  } else if (!transactions) {
    return null;
  }

  // Get all monthly budgets up to the current month
  const { data: monthlyBudgets, error: bugdetsError } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", user.id)
    .lte("month", month.toISOString())
    .order("month", { ascending: true });

  // Same here.
  // TODO: Check if this is true and remove the second if statement.
  if (bugdetsError) {
    console.error("Error fetching monthly budgets: ", bugdetsError);
    return new AppError("PG_ERROR", bugdetsError.message, bugdetsError.code);
  } else if (!monthlyBudgets) {
    return null;
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

  // TODO: Same here.
  if (categoryError) {
    console.error("Error fetching monthly category details: ", categoryError);
    return new AppError("PG_ERROR", categoryError.message, categoryError.code);
  } else if (!monthlyCategoryDetails) {
    return null;
  }

  //  We'll sum up all previous inflow transactions, subtract the amount
  // assigned to all categories, and subtract previous uncategorized outflow.
  // This will give us the available amount for the current month.
  // TODO: This is a lot of calculations. We should probably break this up into
  // TODO: smaller functions. Also, tests.

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
): Promise<Budget | AppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
      authError?.status,
    );
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  return data;
}

export async function getMonthlyCategoryDetails(
  budgetId: number,
  month: string,
): Promise<MonthlyCategoryDetails[] | AppError> {
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
    );
  }

  const { data: details, error } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", month);

  if (error) {
    console.error("Error fetching monthly category details: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  return details;
}

// I don't think we need to export this. Just use it in other server actions
// to recalulate the total available amount after a transaction is added.
export async function calculateAvailableAmount(
  budgetId: number,
  month: string,
): Promise<number | AppError> {
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
    );
  }

  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId)
    .lte("date", month);

  if (transactionError || !transactions) {
    console.error("Error fetching transactions: ", transactionError);
    return new AppError(
      "PG_ERROR",
      transactionError.message,
      transactionError.code,
    );
  }

  const { data: monthlyCategoryDetails, error: categoryError } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", month);

  if (categoryError || !monthlyCategoryDetails) {
    console.error("Error fetching monthly category details: ", categoryError);
    return new AppError("PG_ERROR", categoryError.message, categoryError.code);
  }

  const totalInflow = transactions
    .filter((t) => t.transaction_type === "inflow")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAssigned = monthlyCategoryDetails.reduce(
    (acc, curr) => acc + Number(curr.amount_assigned),
    0,
  );

  const totalUncategorizedOutflow = transactions
    .filter((t) => t.transaction_type === "outflow" && !t.category_id)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableAmount =
    totalInflow - totalAssigned - totalUncategorizedOutflow;

  return availableAmount;
}

// creates a new monthly budget for the current month
export async function createMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | AppError> {
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
    );
  }
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Format date as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth).toISOString().split('T')[0];


  const { data, error } = await supabase
    .from("monthly_budgets")
    .insert([{user_id: user.id, budget_id: budgetId, month: firstDayOfMonthUTC}])
    .select()
    .single();

  if (error || !data) {
    console.error("Error fetching monthly budgets: ", error);
    return new AppError("PG_ERROR", error.message, error.code);
  }

  return data;
}
