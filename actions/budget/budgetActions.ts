// src/actions/budget/budgetActions.ts

import { AppError } from "@/errors";
import { MonthlyBudget, PlainAppError, Budget } from "@/types";

// Example Action: Calculate Available Amount
export async function calculateAvailableAmount(
  transactions: Transaction[],
  monthlyCategoryDetails: CategoryWithDetails[]
): Promise<number | PlainAppError> {
  try {
    const totalInflow = transactions
      .filter((t) => t.transaction_type === "inflow")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalAssigned = monthlyCategoryDetails.reduce(
      (acc, curr) => acc + Number(curr.amount_assigned),
      0,
    );

    const totalUncategorizedOutflow = transactions
      .filter((t) => t.transaction_type === "outflow" && !t.category_id)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const availableAmount =
      totalInflow - totalAssigned - totalUncategorizedOutflow;

    return availableAmount;
  } catch (error: any) {
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }
}

// Example Action: Create Monthly Budget
export async function createMonthlyBudget(
  budgetId: number,
  month: Date,
): Promise<MonthlyBudget | PlainAppError> {
  try {
    // Your implementation for creating a monthly budget
  } catch (error: any) {
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }
}