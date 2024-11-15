"use client";
import React from "react";
import {
  Budget,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/app/types";

interface DebugPageProps {
  budget?: Budget | { error: string };
  categoryWithDetails?: CategoryWithDetails[] | { error: string };
  monthlyBudget?: MonthlyBudget | { error: string };
  transactions?: Transaction[] | { error: string };
  handleTransaction: (e: React.FormEvent<HTMLFormElement>) => void;
}

// app/debug/page.tsx
export default function DisplayForm({
  budget,
  categoryWithDetails,
  monthlyBudget,
  transactions,
  handleTransaction,
}: DebugPageProps) {


  return (
    <div className="p-4">
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Budget</h2>
        <pre className="rounded bg-gray-100 p-4 dark:bg-black">
          {JSON.stringify(
            {
              budget,
              isError: budget instanceof Object && "error" in budget,
              isNull: budget === null,
            },
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Current Monthly Budget</h2>
        <pre className="rounded bg-gray-100 p-4 dark:bg-black">
          {JSON.stringify(monthlyBudget, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Categories With Details</h2>
        <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 dark:bg-black">
          {categoryWithDetails && JSON.stringify(categoryWithDetails, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
        {Array.isArray(transactions) ? (
          transactions.map((tx) => (
            <pre key={tx.id} className="mb-2 rounded bg-gray-100 p-4 dark:bg-black">
              TxID: {tx.id} --- Amount: {tx.amount}
            </pre>
          ))
        ) : (
          <pre className="rounded bg-gray-100 p-4 dark:bg-black">
            {transactions?.error}
          </pre>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold ">Add Transaction</h2>
        <form onSubmit={handleTransaction} className="space-y-4">
          <input
            type="input"
            name="amount"
            placeholder="Amount"
            className="w-full rounded border p-2 dark:bg-gray-800"
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
