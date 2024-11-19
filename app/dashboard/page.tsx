import React from "react";
import {
  getDefaultBudget,
  getTodaysMonthlyBudget,
  getCategoriesWithDetails,
  getCategoryGroups,
} from "@/actions";
import HeadingBar from "@/app/dashboard/headingBar";
import BudgetTable from "./budgetTable";
import {
  Budget,
  MonthlyBudget,
  CategoryGroup,
  CategoryWithDetails,
} from "@/types/types";
import { AppError, PlainAppError } from "@/errors";

// Sort the category groups by priority (Bills, Needs, Wants, and anything else)
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
  // These steps can probably be condensed into one or two action calls.
  // Find Budget > Find curr MonthlyBudget >
  // > Get Categories joined with Monthly Category Details table > Get CategoryGroups
  const budget: Budget | PlainAppError = await getDefaultBudget();

  if (budget instanceof AppError) {
    // We can check if we need the user to login again.
    // But our middleware should handle this so I'm not gonna worry about it.

    // We will have to handle this somehow. Depends on the error.
    // Maybe the user has no budget?
    // Or is it a supabase/postgres error.
    // Need to check the error message.
    return (
      <div>
        Error fetching budget: {budget.name}, {budget.message}, {budget.code}
      </div>
    );
  }

  // Fetch the current monthly budget.
  // Need to extend to allow user to select other months.
  const currMonthlyBudget: MonthlyBudget | PlainAppError = await getTodaysMonthlyBudget(
    budget.id,
  );

  console.log("currMonthlyBudget", currMonthlyBudget);

  if (currMonthlyBudget instanceof Error) {
    // We will have to handle this somehow. Create a new budget? Each budget
    // should only have one monthlyBudget row per month.
    // Or is it a supabase/postgres error.
    // Need to check the error message. Might create new error types
    // (e.g. AuthError, DatabaseError, etc.)
    return (
      <div>
        Error fetching current monthly budget: {currMonthlyBudget.message}
      </div>
    );
  }

  const categories: CategoryWithDetails[] | PlainAppError =
    await getCategoriesWithDetails(currMonthlyBudget.id);
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
      <BudgetTable
        categoryGroups={sortedCategoryGroups}
        categories={categories}
      />
    </div>
  );
}
