import React from "react";
import {
  getDefaultBudget,
  getCurrMonthlyBudget,
  getCategoriesWithDetails,
  getCategoryGroups,
} from "@/app/actions";
import HeadingBar from "@/components/tailwindui/headingBar";
import BudgetTable from "./budgetTable";
import { Budget, MonthlyBudget } from "@/app/types";
import { PostgrestError } from "@supabase/postgrest-js";

export default async function Page() {
  // These steps can probably be condensed into one or two function calls.
  // Find BudgetID > Find curr MonthlyBudgetID > Get Categories > Get CategoryGroups
  const budget: Budget | null = await getDefaultBudget();
  const monthlyBudget: MonthlyBudget | PostgrestError =
    await getCurrMonthlyBudget(budget!.id as number);
  if (monthlyBudget instanceof Error) {
    // We will have to handle this somehow. Create a new budget? Each budget
    // should only have one monthlyBudget row per month.
    console.error("Error fetching current monthly budget", monthlyBudget);
    return;
  }
  const currMonthlyBudgetID = monthlyBudget!.id as number;
  const categories = await getCategoriesWithDetails(currMonthlyBudgetID);
  const categoryGroups = await getCategoryGroups(budget!.id as number);

  return (
    <div>
      <HeadingBar monthlyBudget={monthlyBudget} />
      <BudgetTable categoryGroups={categoryGroups} categories={categories} />
    </div>
  );
}
