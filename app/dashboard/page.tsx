import React, { Suspense } from "react";
import {
  Budget,
  CategoryGroup,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/types/types";
import { AppError, isPlainAppError, PlainAppError } from "@/errors";
import { createDefaultBudget, createMonthlyBudget } from "@/actions";
import { Toaster } from "sonner";
import { createClient } from "@/utils/supabase/server";
import BudgetDisplay from "./dash-components/budgetInfo";
import MonthlyBudgetDisplay from "./dash-components/monthlyBudgetInfo";
import { Divider } from "@/components/divider";
import TransactionsDisplay from "./dash-components/transactionsTable/transactionsTable";
import AddCategoryForm from "./dash-components/addCateogryForm";
import AddTransactionForm from "./dash-components/addTransactionForm";
import { Skeleton } from "@/components/ui/skeleton";
import CategoriesTable from "./dash-components/categoriesTable/categoriesTable";

export default async function DashboardPage() {
  // We need the budget and the monthly budget id's
  // Todo: Fetch budget info from query params. If no params exist, default to current month.

  const budget: Budget | PlainAppError = await getDefaultBudget();
  if (isPlainAppError(budget)) {
    return <div>Budget Fetch Error: {budget.error.message}</div>;
  }

  const currMonthlyBudget: MonthlyBudget | PlainAppError =
    await getTodaysMonthlyBudget(budget.id);
  if (isPlainAppError(currMonthlyBudget)) {
    return (
      <div>Fetch Monthly Budget Error: {currMonthlyBudget.error.message}</div>
    );
  }

  // Could return an empty array if there are no transactions
  // const txs: Transaction[] | PlainAppError = await getTransactions(budget.id);

  // if (isPlainAppError(txs)) {
  //   return <div>TX Fetch Error: {txs.error.message}</div>;
  // }

  // // Sort transactions by date first (desc), then by id if dates are the same (asc)
  // txs.sort((a, b) => {
  //   const dateComparison =
  //     new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
  //   if (dateComparison !== 0) {
  //     return dateComparison;
  //   }
  //   return a.id - b.id;
  // });

  // const categoriesWithDetails: CategoryWithDetails[] | PlainAppError =
  //   await getCategoriesWithDetails(currMonthlyBudget.id);

  // if (isPlainAppError(categoriesWithDetails)) {
  //   return (
  //     <div>Category Fetch Error: {categoriesWithDetails.error.message}</div>
  //   );
  // }

  // const categoryGroups: CategoryGroup[] | PlainAppError =
  //   await getCategoryGroups(budget.id);

  // if (isPlainAppError(categoryGroups)) {
  //   return (
  //     <div>Category Groups Fetch Error: {categoryGroups.error.message}</div>
  //   );
  // }

  const categoryPromise = getCategoriesWithDetails(
    budget.id,
    currMonthlyBudget.id,
  );

  const transactionsPromise = getTransactions(budget.id);

  return (
    <>
      <Toaster />
      <div className="sm:p-4">
        <BudgetDisplay budget={budget} />

        <Divider className="my-6" />

        <MonthlyBudgetDisplay monthlyBudget={currMonthlyBudget} />

        <Divider className="my-6" />

        <Suspense
          fallback={
            <Skeleton className="h-[56px] w-auto rounded-t bg-gray-200 dark:bg-gray-800" />
          }
        >
          <CategoriesTable
            categoriesWithDetailsPromise={categoryPromise}
            monthlyBudgetId={currMonthlyBudget.id}
          />
        </Suspense>

        <Divider className="my-6" />

        <Suspense
          fallback={
            <Skeleton className="h-[56px] w-auto rounded-t bg-gray-200 dark:bg-gray-800" />
          }
        >
          <TransactionsDisplay
            transactionsPromise={transactionsPromise}
            categoriesWithDetailsPromise={categoryPromise}
          />
        </Suspense>

        <Divider className="my-6" />

        {/* <AddCategoryForm
          budgetId={budget.id}
          monthlyBudgetId={currMonthlyBudget.id}
        />

        <Divider className="my-6" />

        <AddTransactionForm monthlyBudgetId={currMonthlyBudget.id} /> */}

        <Divider className="my-6" />
      </div>
    </>
  );
}

async function getDefaultBudget(): Promise<Budget | PlainAppError> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Return our custom error type if there is an auth error from Supabase
  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code || "AUTH_FAILURE",
      status: authError?.status || 401,
      hint: { hint: "Try logging in again." },
    }).toPlainObject();
  }

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
    // in a future update, we can allow for multiple budgets.
    // Todo: move this to a call from the client. (does that matter?)
    if (error.code === "PGRST116") {
      const budgetName = `${user.email}'s Budget`;
      return await createDefaultBudget(budgetName);
    }
    console.error("Error fetching budgets: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  return budget;
}

async function getTransactions(
  budgetId: number,
): Promise<Transaction[] | PlainAppError> {
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

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId);

  if (error) {
    console.error("Error fetching transactions: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  return transactions;
}

// Inputs:
// budgetId - the ID of the budget to fetch the current monthly budget for (number)
//
// Output: the current monthly budget or an Error
// monthlyBudget - the current monthly budget (Today)
// TODO: Run calculations to update the total available amount upon user login
async function getTodaysMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | PlainAppError> {
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
    }).toPlainObject();
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Convert the date to UTC and format as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth)
    .toISOString()
    .split("T")[0];

  // Fetch the current monthly budget
  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", firstDayOfMonthUTC)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no monthly budget found
      // create a monthly budget for the current month
      // TODO: and calculate available amount
      return createMonthlyBudget(budgetId, new Date());
    }
    console.error("Error fetching todays monthly budget: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      hint:
        typeof error.hint === "string"
          ? { message: error.hint }
          : error.hint || {
              budgetId,
              firstDayOfMonthUTC,
            },
    }).toPlainObject();
  }

  //revalidatePath("/dashboard/debug");
  return monthlyBudget;
}

async function getCategoryGroups(
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

// Fetch the JOINed table of our categories and their monthly details
// Inputs:
// budgetId - the ID of the budget to fetch categories for (number)
//
// Output: an array of CategoryWithDetails objects or an Error
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
