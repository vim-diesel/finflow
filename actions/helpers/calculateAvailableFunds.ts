"use server";

import { AppError, PlainAppError } from "@/errors";
import { createServersideClient } from "@/utils/supabase/server";

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
): Promise<number | null | PlainAppError> {
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
    ).toPlainObject();
  }

  // Validate currMonth
  if (!(month instanceof Date) || isNaN(month.getTime())) {
    return new AppError("VALIDATION_ERROR", "Invalid date provided").toPlainObject();
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

  if (transactionsError) {
    console.error("Error fetching transactions: ", transactionsError);
    return new AppError(
      "DB_ERROR",
      transactionsError?.message,
      transactionsError?.code,
    ).toPlainObject();
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
    return new AppError(
      "DB_ERROR",
      bugdetsError.message,
      bugdetsError.code,
    ).toPlainObject();
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
    return new AppError(
      "DB_ERROR",
      categoryError.message,
      categoryError.code,
    ).toPlainObject();
  } else if (!monthlyCategoryDetails) {
    return null;
  }

  // We'll sum up all previous inflow transactions, subtract the amount
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


// *************************



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

  if (transactionError) {
    console.error("Error fetching transactions: ", transactionError);
    return new AppError(
      "DB_ERROR",
      transactionError.message,
      transactionError.code,
    );
  } else if (!transactions) {
    return 0;
  }

  const { data: monthlyCategoryDetails, error: categoryError } = await supabase
    .from("monthly_category_details")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", month);

  if (categoryError || !monthlyCategoryDetails) {
    console.error("Error fetching monthly category details: ", categoryError);
    return new AppError("DB_ERROR", categoryError.message, categoryError.code);
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