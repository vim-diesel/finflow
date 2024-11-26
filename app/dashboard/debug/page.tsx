export const fetchCache = "force-no-store";

import React from "react";
import {
  Budget,
  CategoryGroup,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/types/types";
import { isPlainAppError, PlainAppError } from "@/errors";
import {
  getDefaultBudget,
  getTodaysMonthlyBudget,
  getTransactions,
  getCategoriesWithDetails,
  getCategoryGroups,
  updateAvailableAmount,
} from "@/actions";
import DisplayForm from "./displayForm";
import { Toaster } from "sonner";

// app/debug/page.tsx
export default async function DebugPage() {
  const budget: Budget | PlainAppError = await getDefaultBudget();

  if (isPlainAppError(budget)) {
    return <div>Budget Fetch Error: {budget.error.message}</div>;
  }

  // Could return an empty array if there are no transactions
  const txs: Transaction[] | PlainAppError = await getTransactions(budget.id);

  if (isPlainAppError(txs)) {
    return <div>TX Fetch Error: {txs.error.message}</div>;
  }

  // Todo: Fetch monthly budget from query params. If no params exist, default to current month.
  const currMonthlyBudget: MonthlyBudget | PlainAppError =
    await getTodaysMonthlyBudget(budget.id);

  if (isPlainAppError(currMonthlyBudget)) {
    return (
      <div>Fetch Monthly Budget Error: {currMonthlyBudget.error.message}</div>
    );
  }

  const categoriesWithDetails: CategoryWithDetails[] | PlainAppError =
    await getCategoriesWithDetails(currMonthlyBudget.id);

  if (isPlainAppError(categoriesWithDetails)) {
    return <div>Category Fetch Error: {categoriesWithDetails.error.message}</div>;
  }

  const categoryGroups: CategoryGroup[] | PlainAppError =
    await getCategoryGroups(budget.id);

  if (isPlainAppError(categoryGroups)) {
    return (
      <div>Category Groups Fetch Error: {categoryGroups.error.message}</div>
    );
  }


  return (
    <>
      <Toaster />
      <DisplayForm
        budget={budget}
        monthlyBudget={currMonthlyBudget}
        transactions={txs}
        categoriesWithDetails={categoriesWithDetails}
        categoryGroups={categoryGroups}
      />
    </>
  );
}
