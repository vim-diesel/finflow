"use client";

import { CategoryWithDetails } from "@/types";
import {
  UpdateAssignedModal,
  UpdateCategoryNameModal,
  UpdateGoalModal,
} from "./updateModals";
import { isPlainAppError, PlainAppError } from "@/errors";
import { toast } from "sonner";
import { deleteCategory, updateCategoryName, updateMonthlyGoal } from "@/actions";
import { updateAssigned } from "@/actions/monthlyCategoryDetails";
import { MonthlyBudget } from '@/types/types';

type CategoriesDisplayProps = {
  categoriesWithDetails: CategoryWithDetails[] | PlainAppError;
  monthlyBudget: MonthlyBudget | PlainAppError;
};

export default function CategoriesDisplay({
  categoriesWithDetails,
  monthlyBudget,
}: CategoriesDisplayProps) {

  async function handleUpdateCategoryName(categoryId: number, newName: string) {
    console.log("Updating category name...", categoryId, newName);
    const res = await updateCategoryName(categoryId, newName);
    if (res?.error) {
      const errStr = `Error updating category name: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Category name updated successfully!");
      return;
    }
  }

  async function handleUpdateAssigned(
    categoryId: number,
    oldAmount: number,
    newAmount: number,
  ) {
    if (!monthlyBudget || isPlainAppError(monthlyBudget)) {
      toast.error("Monthly budget is not defined or is an error", {
        className: "bg-rose-500",
      });
      return;
    }
    const parsedNewAmount = Number(newAmount.toFixed(2));
    if (isNaN(parsedNewAmount)) {
      toast.warning("Amount must be a number...", {
        className: "bg-yellow-200",
      });
      return;
    }
    const res = await updateAssigned(
      monthlyBudget.id,
      categoryId,
      oldAmount,
      parsedNewAmount,
    );

    if (isPlainAppError(res)) {
      const errStr = `Error updating assigned dollars: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Updated!");
      return;
    }
  }

  async function handleUpdateGoal(categoryId: number, amount: number) {
    const res = await updateMonthlyGoal(categoryId, amount);
    if (res?.error) {
      const errStr = `Error updating goal: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Goal updated successfully!");
      return;
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    const res = await deleteCategory(categoryId);
    if (res?.error) {
      const errStr = `Error deleting category: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Category deleted successfully!");
      return;
    }
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Categories With Details</h2>
      <div className="overflow mb-4 w-full">
        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Assigned</div>
          <div className="font-semibold">Spent</div>
          <div className="font-semibold">Goal</div>
        </div>

        {/* Table Rows */}
        {Array.isArray(categoriesWithDetails) &&
          categoriesWithDetails.map((c) => {
            if (c.name === "Ready to Assign") {
              return null;
            }
            return (
              <div
                key={c.id}
                className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 rounded bg-gray-100 p-4 dark:bg-black"
              >
                <UpdateCategoryNameModal
                  category={c}
                  handlerUpdate={handleUpdateCategoryName}
                  handlerDelete={handleDeleteCategory}
                />
                <div>
                  <UpdateAssignedModal c={c} handler={handleUpdateAssigned} />
                </div>
                <div>
                  $
                  {c.monthly_category_details === null ||
                  c.monthly_category_details?.amount_spent === null
                    ? "0"
                    : c.monthly_category_details?.amount_spent === 0
                      ? "0"
                      : c.monthly_category_details?.amount_spent !== null &&
                          c.monthly_category_details?.amount_spent % 1 === 0
                        ? c.monthly_category_details?.amount_spent
                        : c.monthly_category_details?.amount_spent !== null
                          ? c.monthly_category_details.amount_spent.toFixed(2)
                          : "0"}
                </div>
                <div>
                  <UpdateGoalModal c={c} handler={handleUpdateGoal} />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
