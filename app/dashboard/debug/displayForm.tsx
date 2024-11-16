"use client";
import React from "react";
import {
  Budget,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/app/types";
import { toast } from "sonner";
import { PlainAppError } from "@/app/errors";
import { addTransaction } from "@/app/actions";

interface DebugPageProps {
  budget?: Budget | null;
  categoryWithDetails?: CategoryWithDetails[] | null;
  monthlyBudget?: MonthlyBudget | null;
  transactions?: Transaction[] | null;
}

// app/debug/page.tsx
export default function DisplayForm({
  budget,
  categoryWithDetails,
  monthlyBudget,
  transactions,
}: DebugPageProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const amount = Number(e.currentTarget.amount.value);
    if (!amount) {
      toast.warning("Enter your amount first...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    } else if (isNaN(Number(amount)) || amount === undefined) {
      toast.warning("Amount must be a number...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }
    if (!budget || "error" in budget) {
      // this shouldn't happen, if there's an error, it should be handled in the
      // parent component and this component should not be rendered
      toast.error("Error getting the budget from server page component...");
      setLoading(false);
      return;
    }

    console.log("Adding transaction: ", budget.id, amount);
    const response = await addTransaction(budget.id, Number(amount), "inflow");
    if (response?.error.name === "ERROR") {
      const errStr = `Error adding transaction: ${response.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    }

    toast.success("Transaction added successfully!");
    setLoading(false);
    return;
  }

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
        {Array.isArray(transactions) &&
          transactions.map((tx) => (
            <pre
              key={tx.id}
              className="mb-2 rounded bg-gray-100 p-4 dark:bg-black"
            >
              TxID: {tx.id} --- Amount: {tx.amount}
            </pre>
          ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="space-y-4">
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
      <button
        onClick={() => toast.error("Error", { className: "bg-rose-500" })}
      >
        Click me
      </button>
      {loading && <div>Loading...</div>}
    </div>
  );
}
