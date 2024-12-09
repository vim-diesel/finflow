
import {
  Budget,
  CategoryGroup,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/types/types";

import { Divider } from "@/components/divider";
import BudgetDisplay from "./dash-components/budgetInfo";
import MonthlyBudgetDisplay from "./dash-components/monthlyBudgetInfo";
import CategoriesDisplay from "./dash-components/categoriesWithDetails";
import TransactionsDisplay from "./dash-components/transactions";
import AddCategoryForm from "./dash-components/addCateogryForm";
import AddTransactionForm from "./dash-components/addTransactionForm";
import { PlainAppError } from "@/errors";

interface DebugPageProps {
  budget: Budget | PlainAppError;
  categoriesWithDetails: CategoryWithDetails[] | PlainAppError;
  monthlyBudget: MonthlyBudget | PlainAppError;
  transactions: Transaction[] | PlainAppError;
  categoryGroups: CategoryGroup[] | PlainAppError;
}

export default function DisplayForm({
  budget,
  categoriesWithDetails,
  monthlyBudget,
  transactions,
  categoryGroups,
}: DebugPageProps) {

  return (
    <div className="sm:p-4">
      <BudgetDisplay budget={budget} />

      <Divider className="my-6" />

      <MonthlyBudgetDisplay monthlyBudget={monthlyBudget} />

      <Divider className="my-6" />

      <CategoriesDisplay categoriesWithDetails={categoriesWithDetails} monthlyBudget={monthlyBudget}/>

      <Divider className="my-6" />

      <TransactionsDisplay transactions={transactions} categoriesWithDetails={categoriesWithDetails} />

      <Divider className="my-6" />

      <AddCategoryForm categoryGroups={categoryGroups} monthlyBudget={monthlyBudget} />

      <Divider className="my-6" />

      <AddTransactionForm budget={monthlyBudget} />

      <Divider className="my-6" />
    </div>
  );
}
