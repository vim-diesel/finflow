"use client";

import { addTransaction } from "@/actions";
import { Button } from "@/components/button";
import { Label } from "@/components/fieldset";
import { Input, InputGroup } from "@/components/input";
import { Radio, RadioField, RadioGroup } from "@/components/radio";
import { isPlainAppError, PlainAppError } from "@/errors";
import { MonthlyBudget } from "@/types";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "sonner";

type AddTransactionFormProps = {
  budget: MonthlyBudget | PlainAppError;
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddTransactionForm({
  budget,
}: AddTransactionFormProps) {
  const [inputAmount, setInputAmount] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("inflow");
  const [date, setDate] = useState<string>(getCurrentDate());

  async function handleAddTransaction() {
    const amount = Number(inputAmount);

    if (isNaN(amount)) {
      toast.warning("Amount must be a number...", {
        className: "bg-yellow-200",
      });
      return;
    } else if (
      !transactionType ||
      (transactionType !== "inflow" && transactionType !== "outflow")
    ) {
      toast.warning("Invalid transaction type...", {
        className: "bg-yellow-200",
      });
      return;
    }

    if (!budget || isPlainAppError(budget)) {
      toast.error("Budget is not defined or is an error", {
        className: "bg-rose-500",
      });
      return;
    }

    const response = await addTransaction(
      budget.id,
      Number(amount),
      transactionType as "inflow" | "outflow",
      null,
      new Date(date),
    );

    if (response?.error) {
      const errStr = `Error adding transaction: ${response.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    }

    toast.success("Transaction added successfully!");
    setInputAmount("");
    return;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-2xl font-bold">Add Transaction</h2>
      <InputGroup>
        <CurrencyDollarIcon />
        <Input
          name="amount"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Amount"
          className="max-w-32"
        />
      </InputGroup>

      <RadioGroup
        name="transactionType"
        defaultValue="inflow"
        aria-label="Transaction Type"
        className="my-2 space-y-1"
        onChange={setTransactionType}
      >
        <RadioField>
          <Radio value="inflow" />
          <Label className="w-fit">Inflow</Label>
        </RadioField>
        <RadioField>
          <Radio value="outflow" />
          <Label className="w-fit">Outflow</Label>
        </RadioField>
      </RadioGroup>
      <Input
        type="date"
        name="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="my-2 max-w-32"
      />
      <Button onClick={() => handleAddTransaction()}>Add</Button>
    </section>
  );
}
