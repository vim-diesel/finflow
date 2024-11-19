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
import { addCategory, addTransaction } from "@/actions";
import { Button } from "@/components/button";
import { set } from "zod";
import { a } from "framer-motion/client";
import { RadioField, RadioGroup } from "@/components/radio";
import { Radio } from "../../../components/radio";
import { Label } from "@headlessui/react";

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
  const [inputCategory, setInputCategory] = React.useState<string>("");
  const [inputAmount, setInputAmount] = React.useState<number | string>("");
  const [inputType, setInputType] = React.useState<"inflow" | "outflow">(
    "inflow",
  );

  async function handleAddCategory() {
    setLoading(true);
    if (!inputCategory) {
      toast.warning("Enter category name first...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }
    const res = await addCategory(inputCategory, 1);
    setLoading(false);
    toast.success("Category added successfully!");
  }

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
          {Array.isArray(categoryWithDetails) &&
            categoryWithDetails.map((c) => (
              <pre key={c.id} className="mb-2">
                {JSON.stringify(c, null, 2)}
              </pre>
            ))}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
        <div className="mb-4 w-full">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
            <div className="font-semibold">TxID</div>
            <div className="font-semibold">Amount</div>
            <div className="font-semibold">Type</div>
          </div>
          {/* Table Rows */}
          {Array.isArray(transactions) &&
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="mb-2 grid grid-cols-3 gap-4 rounded bg-gray-100 p-4 dark:bg-black"
              >
                <div>{tx.id}</div>
                <div>{tx.amount}</div>
                <div>{tx.transaction_type}</div>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-bold">Add Category</h2>
        <input
          type="input"
          name="category"
          placeholder="Category Name"
          className="mb-2 w-full rounded border p-2 dark:bg-gray-800"
          value={inputCategory}
          onChange={(e) => setInputCategory(e.target.value)}
        />
        <Button onClick={handleAddCategory}> Add </Button>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-bold">Add Transaction</h2>
        <input
          type="input"
          name="amount"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Amount"
          className="mb-2 w-full rounded border p-2 dark:bg-gray-800"
        />
        <div className="mb-2">
          <RadioGroup
            name="transactionType"
            defaultValue="inflow"
            aria-label="Transaction Type"
            className="space-y-1"
          >
            <RadioField>
              <Radio value="inflow" />
              <Label>Inflow</Label>
            </RadioField>
            <RadioField>
              <Radio value="outflow" />
              <Label>Outflow</Label>
            </RadioField>
          </RadioGroup>
        </div>
        <Button onClick={() => handleAddTransaction(inputAmount, inputType)}>
          Add
        </Button>
      </section>
      {loading && <div>Loading...</div>}
    </div>
  );
}
