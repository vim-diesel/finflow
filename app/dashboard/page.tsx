import React from "react";
import { getBudgets, getMonthlyBudgets } from "./actions";
import { Database } from "@/database.types"; // Adjust the import path as needed
import HeadingBar from "@/components/tailwindui/headingBar";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type MonthlyBudget = Database["public"]["Tables"]["monthly_budgets"]["Row"];

export default async function Page() {
  const budgets: Budget[] = await getBudgets();
  const mainBudget = budgets[0];

  const monthlyBudgets: MonthlyBudget[] = await getMonthlyBudgets();

  return (
    <div>
      <HeadingBar monthlyBudget={monthlyBudgets[0]} />
    </div>
  );
}
