import React from "react";
import {
  getDefaultBudget,
  getCurrMonthlyBudget,
  getCategoriesWithDetails,
  getCategoryGroups,
} from "@/app/actions";
import HeadingBar from "@/app/dashboard/headingBar";
import BudgetTable from "./budgetTable";
import { Budget, MonthlyBudget, CategoryGroup } from "@/app/types";

function sortCategoryGroups(categoryGroups: CategoryGroup[]): CategoryGroup[] {
  const priority: { [key: string]: number } = {
    Bills: 1,
    Needs: 2,
    Wants: 3,
  };

  return categoryGroups.sort((a, b) => {
    const priorityA = priority[a.name] || 4; // Default to 4 if not found
    const priorityB = priority[b.name] || 4; // Default to 4 if not found
    return priorityA - priorityB;
  });
}

export default async function Page() {
  // These steps can probably be condensed into one or two function calls.
  // Find BudgetID > Find curr MonthlyBudgetID > 
  // > Get Categories joined with Monthly Category Details table > Get CategoryGroups
  const budget = await getDefaultBudget();

  if (budget instanceof Error) {
    // We will have to handle this somehow. Create a new budget?
    // Or is it a supabase/postgres error.
    // Auth error?
    // Need to check the error message.
    return;
  }

  // Fetch the current monthly budget.
  // Need to extend to allow user to select other months.
  const currMonthlyBudget: MonthlyBudget | Error = await getCurrMonthlyBudget(
    budget.id,
  );

  if (currMonthlyBudget instanceof Error) {
    // We will have to handle this somehow. Create a new budget? Each budget
    // should only have one monthlyBudget row per month.
    // Or is it a supabase/postgres error.
    // Need to check the error message. Might create new error types 
    // (e.g. AuthError, ServerError, etc.)
    return;
  }

  const categories = await getCategoriesWithDetails(currMonthlyBudget.id);
  if (categories instanceof Error) {
    // We will have to handle this somehow. Depends on the error.
    // Maybe the user has no categories?
    // Or is it a supabase/postgres error.
    // Need to check the error message.
    return;
  } else if (!categories || categories.length === 0) {
    // User has no categories? We should probably create some default ones.
    return;
  }

  const categoryGroups = await getCategoryGroups(budget.id);
  if (categoryGroups instanceof Error) {
    // We will have to handle this somehow. Depends on the error.
    // Maybe the user has no category groups?
    // Or is it a supabase/postgres error.
    // Need to check the error message.
    return;
  }
  
  // Sort the category groups (Bils, Needs, Wants, and anything else)
  const sortedCategoryGroups = sortCategoryGroups(categoryGroups);

  return (
    <div>
      <HeadingBar monthlyBudget={currMonthlyBudget} />
      <BudgetTable categoryGroups={sortedCategoryGroups} categories={categories} />
    </div>
  );
}
