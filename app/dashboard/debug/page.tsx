import React from "react";
import {
  Budget,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/app/types";
import { isPlainAppError, PlainAppError } from "@/app/errors";
import {
  addTransaction,
  getDefaultBudget,
  getTodaysMonthlyBudget,
  getTransactions,
  getCategoriesWithDetails,
} from "@/app/actions";
import DisplayForm from "./displayForm";
import { Toaster } from "sonner";

// app/debug/page.tsx
export default async function DebugPage() {
  const budget: Budget | PlainAppError = await getDefaultBudget();

  if (isPlainAppError(budget)) {
    return <div>Budget Fetch Error: {budget.error.message}</div>;
  } else if (!budget) {
    return <div>Loading...</div>;
  }

  const txs = await getTransactions(budget.id);

  if (isPlainAppError(txs)) {
    return <div>TX Fetch Error: {txs.error.message}</div>;
  } else if (!txs) {
    return <div>Loading...</div>;
  }

  const currMonthlyBudget = await getTodaysMonthlyBudget(budget.id);

  if (isPlainAppError(currMonthlyBudget)) {
    return <div>Fetch Monthly Budget Error: {currMonthlyBudget.error.message}</div>;
  } else if (!currMonthlyBudget) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <DisplayForm
        budget={budget}
        monthlyBudget={currMonthlyBudget}
        transactions={txs}
      />
    </>
  );
}
