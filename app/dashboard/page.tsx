import React, { Suspense } from "react";
import {
  Budget,
  MonthlyBudget,
} from "@/types/types";
import { isPlainAppError, PlainAppError } from "@/errors";

import { Toaster } from "sonner";
import BudgetDisplay from "./dash-components/budgetInfo";
import MonthlyBudgetDisplay from "./dash-components/monthlyBudgetInfo";
import { Divider } from "@/components/divider";
import TransactionsDisplay from "./dash-components/transactionsTable/transactionsTable";
import AddCategoryForm from "./dash-components/addCateogryForm";
import AddTransactionForm from "./dash-components/addTransactionForm";
import { Skeleton } from "@/components/ui/skeleton";
import CategoriesTable from "./dash-components/categoriesTable/categoriesTable";
import { getCategoriesWithDetails, getDefaultBudget, getTodaysMonthlyBudget, getTransactions } from "./dash-functions";

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
