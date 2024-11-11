"use client";
import {
  addTransaction,
  getDefaultBudget,
  getTransactions,
} from "@/app/actions";
import React from "react";

import { Budget, Transaction } from "@/app/types";

// app/debug/page.tsx
export default function DebugPage() {
  const [budget, setBudget] = React.useState<Budget | Error | null>(null);
  const [transactions, setTransactions] = React.useState<
    Transaction[] | Error | null
  >(null);

  React.useEffect(() => {
    async function fetchBudget() {
      console.log("fetchBudget called within useEffect");
      const res = await getDefaultBudget();
      setBudget(res);
    }
    fetchBudget();
  }, []);

  React.useEffect(() => {
    async function fetchTransactions(budgetId: number) {
      console.log("fetchTransactions called within useEffect");
      const res = await getTransactions(budgetId);
      setTransactions(res);
    }
    if (budget && !(budget instanceof Error)) {
      fetchTransactions(budget.id);
    }
  }, [budget]);

  async function handleTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const amount = parseFloat(formData.get("amount") as string) || 0;

    console.log("formdataAmount: ", formData.get("amount"));
    console.log("parsed amount: ", amount);

    if (budget && !(budget instanceof Error)) {
      addTransaction(budget.id, amount, "inflow");
      const res = await getTransactions(budget.id);
      setTransactions(res);
    }
  }

  return (
    <div>
      <h5>getDefaultBudget()</h5>
      <pre>
        {JSON.stringify(
          {
            result: budget,
            type: typeof budget,
            isError: budget instanceof Error,
            isNull: budget === null,
          },
          null,
          2,
        )}
      </pre>
      <h5>Transactions</h5>
      {transactions && !(transactions instanceof Error) ? (
        transactions.map((tx) => (
          <pre key={tx.id}>
            TxID: {tx.id} --- Amount: {tx.amount}
          </pre>
        ))
      ) : (
        <pre>[]</pre>
      )}
      <h5>Add tx</h5>
      <form onSubmit={handleTransaction}>
        <input type="number" name="amount" placeholder="Amount" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
