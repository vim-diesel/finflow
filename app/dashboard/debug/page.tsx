"use client";
import React from "react";
import { Budget, MonthlyBudget, Transaction } from "@/app/types";
import { AppError } from "@/app/errors";
import {
  addTransaction,
  getDefaultBudget,
  getCurrMonthlyBudget,
  getTransactions,
} from "@/app/actions";

// app/debug/page.tsx
export default function DebugPage() {
  const [budget, setBudget] = React.useState<Budget | AppError | null>(null);
  const [transactions, setTransactions] = React.useState<
    Transaction[] | AppError | null
  >(null);
  const [currMonthlyBudget, setCurrMonthlyBudget] = React.useState<
    MonthlyBudget | AppError | null
  >(null);

  React.useEffect(() => {
    async function fetchBudget() {
      const res = await getDefaultBudget();
      setBudget(res);
    }
    fetchBudget();
  }, []);

  React.useEffect(() => {
    async function fetchTransactions(budgetId: number) {
      const res = await getTransactions(budgetId);
      setTransactions(res);
    }
    async function fetchCurrMonthlyBudget(budgetId: number) {
      const res = await getCurrMonthlyBudget(budgetId);
      setCurrMonthlyBudget(res);
    }
    if (budget && !(budget instanceof AppError)) {
      fetchTransactions(budget.id);
      fetchCurrMonthlyBudget(budget.id);
    }
  }, [budget]);

  async function handleTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = parseFloat(formData.get("amount") as string) || 0;

    if (budget && !(budget instanceof Error)) {
      addTransaction(budget.id, amount, "inflow");
      const res = await getTransactions(budget.id);
      setTransactions(res);
    }
  }

  return (
    <div className="p-4">
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Budget</h2>
        <pre className="rounded bg-gray-100 p-4">
          {JSON.stringify(
            {
              budget,
              isError: budget instanceof AppError,
              isNull: budget === null,
            },
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Current Monthly Budget</h2>
        <pre className="rounded bg-gray-100 p-4">
          {JSON.stringify(currMonthlyBudget, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
        {transactions && !(transactions instanceof Error) ? (
          transactions.map((tx) => (
            <pre key={tx.id} className="mb-2 rounded bg-gray-100 p-4">
              TxID: {tx.id} --- Amount: {tx.amount}
            </pre>
          ))
        ) : (
          <pre className="rounded bg-gray-100 p-4">[]</pre>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Add Transaction</h2>
        <form onSubmit={handleTransaction} className="space-y-4">
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="w-full rounded border p-2"
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 p-2 text-white"
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
