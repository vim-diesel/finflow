import React from "react";
import {
  getDefaultBudget,
  getCurrMonthlyBudget,
  getCategoriesWithDetails,
} from "./actions";
import { Database, Tables } from "@/database.types"; // Adjust the import path as needed
import HeadingBar from "@/components/tailwindui/headingBar";
import BudgetTable from "@/components/tailwindui/budgetTable";

type Budget = Tables<"budgets">;
type MonthlyBudget = Tables<"monthly_budgets">;
type Category = Tables<"categories">;
type CategoryGroup = Tables<"category_groups">;
type MonthlyCategoryDetails = Tables<"monthly_category_details">;

// Define a type that represents the structure of the data returned from getCategoriesWithDetails
type CategoryWithDetails = Category & {
  monthly_category_details: MonthlyCategoryDetails[];
};

export default async function Page() {
  const budget: Budget | null = await getDefaultBudget();
  const monthlyBudget: MonthlyBudget | null = await getCurrMonthlyBudget(budget!.id as number);
  const currMonthlyBudgetID = monthlyBudget!.id as number;
  const categories = await getCategoriesWithDetails(currMonthlyBudgetID);
  console.log(JSON.stringify(categories, null, 2));

  return (
    <div>
      <HeadingBar monthlyBudget={monthlyBudget} />
    </div>
  );
}
