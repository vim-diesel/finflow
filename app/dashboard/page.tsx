import React from "react";
import { getBudgets } from "./actions";
import { Database } from "@/database.types"; // Adjust the import path as needed
import { Heading } from "@/components/heading";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export default async function Page() {
  const budgets: Budget[] = await getBudgets();
  const mainBudget = budgets[0];

  return (
    <div>
      <Heading level={1}>{new Date().toDateString()}</Heading>
      {/* Render budgets here */}
      {budgets.map((budget) => (
        <div key={budget.id}>{budget.name}</div>
      ))}
    </div>
  );
}
