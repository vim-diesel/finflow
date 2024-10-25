import React from "react";
import {
  getDefaultBudget,
  getCurrMonthlyBudget,
  getCategoriesWithDetails,
  getCategoryGroups
} from "./actions";
import HeadingBar from "@/components/tailwindui/headingBar";
import BudgetTable from "@/components/tailwindui/budgetTable";
import {Budget, MonthlyBudget, Category, CategoryGroup, MonthlyCategoryDetails, CategoryWithDetails} from './types';

export default async function Page() {
  const budget: Budget | null = await getDefaultBudget();
  const monthlyBudget: MonthlyBudget | null = await getCurrMonthlyBudget(budget!.id as number);
  const currMonthlyBudgetID = monthlyBudget!.id as number;
  const categories = await getCategoriesWithDetails(currMonthlyBudgetID);
  const categoryGroups = await getCategoryGroups(budget!.id as number);

  return (
    <div>
      <HeadingBar monthlyBudget={monthlyBudget} />
      <BudgetTable
        categoryGroups={categoryGroups}
        categories={categories}
      />
    </div>
  );
}
