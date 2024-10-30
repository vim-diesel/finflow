import { Tables, Enums } from "@/database.types";

export type Budget = Tables<"budgets">;
export type MonthlyBudget = Tables<"monthly_budgets">;
export type Category = Tables<"categories">;
export type CategoryGroup = Tables<"category_groups">;
export type MonthlyCategoryDetails = Tables<"monthly_category_details">;
export type Transaction = Tables<"transactions">;

// Define a type that represents the structure of the data returned from getCategoriesWithDetails
export type CategoryWithDetails = Category & {
  monthly_category_details: MonthlyCategoryDetails;
};

export type TransactionTypeEnum = Enums<"transaction_type_enum">