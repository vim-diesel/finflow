import React from "react";
import {
  Budget,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/app/types";
import { AppError } from "@/app/errors";
import {
  addTransaction,
  getDefaultBudget,
  getCurrMonthlyBudget,
  getTransactions,
  getCategoriesWithDetails,
} from "@/app/actions";
import DisplayForm from "./displayForm";

// app/debug/page.tsx
export default async function DebugPage() {
  const budget: Budget | AppError = await getDefaultBudget();

  if (budget instanceof AppError) {
    return <div>Budget Fetch Error: {budget.message}</div>;
  } else if (!budget) {
    return <div>Loading...</div>;
  }

  const txs = await getTransactions(budget.id);

  if (txs instanceof AppError) {
    return <div>TX Fetch Error: {txs.message}</div>;
  } else if (!txs) {
    return <div>Loading...</div>;
  }

  const currMonthlyBudget = await getCurrMonthlyBudget(budget.id);

  if (currMonthlyBudget instanceof AppError) {
    return <div>Fetch Monthly Budget Error: {currMonthlyBudget.message}</div>;
  } else if (!currMonthlyBudget) {
    return <div>Loading...</div>;
  }

  async function handleTransaction(e: React.FormEvent<HTMLFormElement>) {
    "use server";
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = parseFloat(formData.get("amount") as string);
    console.log("amount", amount);

    if (isNaN(amount)) {
      alert("Invalid amount");
      return;
    }

    if (budget && !(budget instanceof AppError)) {
      const res = await addTransaction(budget.id, amount, "inflow");
    }
  }

  return (
    <DisplayForm
      budget={budget}
      monthlyBudget={currMonthlyBudget}
      transactions={txs}
      handleTransaction={handleTransaction}
    />
  );
}
