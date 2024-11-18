"use client";
import React from "react";
import {
  Budget,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/types/types";
import { toast } from "sonner";
import { isPlainAppError, PlainAppError } from "@/errors";
import { addTransaction } from "@/actions";

interface DebugPageProps {
  budget: Budget | PlainAppError;
  categoryWithDetails: CategoryWithDetails[] | PlainAppError;
  monthlyBudget: MonthlyBudget | PlainAppError;
  transactions: Transaction[] | PlainAppError;
}

// app/debug/page.tsx
export default function DisplayForm({
  budget,
  categoryWithDetails,
  monthlyBudget,
  transactions,
}: DebugPageProps) {
  const [loading, setLoading] = React.useState(false);
  const [inputAmount, setInputAmount] = React.useState<number | string>("");
  const [inputType, setInputType] = React.useState<"inflow" | "outflow">(
    "inflow",
  );

  console.log(categoryWithDetails);

  async function handleAddTransaction(
    input: number | string,
    type: "inflow" | "outflow",
  ) {
    setLoading(true);
    const amount = Number(input);
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

    if (isPlainAppError(budget)) {
      // this shouldn't happen, if there's an error, it should be handled in the
      // parent component and this component should not be rendered
      toast.error("Error getting the budget from server page component...");
      setLoading(false);
      return;
    }

    // budget cannot be undefined at this stage.
    const response = await addTransaction(
      budget!.id,
      Number(amount),
      inputType,
    );
    if (response?.error) {
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
              TxID: {tx.id} --- Amount: {tx.amount} --- {tx.transaction_type}
            </pre>
          ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Add Transaction</h2>
        <input
          type="input"
          name="amount"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Amount"
          className="w-full rounded border p-2 dark:bg-gray-800"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="inflow"
              checked={inputType === "inflow"}
              onChange={(e) =>
                setInputType(e.target.value as "inflow" | "outflow")
              }
              className="mr-2"
            />
            Inflow
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="outflow"
              checked={inputType === "outflow"}
              onChange={(e) =>
                setInputType(e.target.value as "inflow" | "outflow")
              }
              className="mr-2"
            />
            Outflow
          </label>
        </div>
        <button
          type="submit"
          onClick={() => handleAddTransaction(inputAmount, inputType)}
          className="w-full rounded bg-blue-500 p-2 text-white"
        >
          Add
        </button>
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
