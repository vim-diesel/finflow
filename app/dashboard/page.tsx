import React from "react";
import { getBudgets } from "./actions";
import { Database } from "@/database.types"; // Adjust the import path as needed

type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export default async function Page() {
  const budgets: Budget[] = await getBudgets();

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render budgets here */}
      {budgets.map((budget) => (
        <div key={budget.id}>{budget.name}</div>
      ))}
    </div>
  );
}
