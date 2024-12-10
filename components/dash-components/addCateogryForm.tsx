"use client";

import { addCategory } from "@/actions";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { isPlainAppError, PlainAppError } from "@/errors";
import { CategoryGroup, MonthlyBudget } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

type AddCategoryFormProps = {
  monthlyBudget: MonthlyBudget | PlainAppError;
  categoryGroups: CategoryGroup[] | PlainAppError;
};

export default function AddCategoryForm({
  monthlyBudget,
  categoryGroups,
}: AddCategoryFormProps) {
  const [inputNewCategory, setInputNewCategory] = useState<string>("");
  const [categoryGroupId, setCategoryGroupId] = useState<number>();

  async function handleAddCategory() {
    if (!inputNewCategory) {
      toast.warning("Enter category name first...", {
        className: "bg-yellow-200",
      });
      return;
    }

    if (!categoryGroupId) {
      toast.warning("Select a category group first...", {
        className: "bg-yellow-200",
      });
      return;
    }

    if (isPlainAppError(monthlyBudget)) {
      toast.error("Monthly budget is not defined or is an error", {
        className: "bg-rose-500",
      });
      return;
    }

    const res = await addCategory(
      monthlyBudget.id,
      inputNewCategory,
      categoryGroupId,
    );
    if (res?.error) {
      const errStr = `Error adding category: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Category added successfully!");
      setInputNewCategory("");
      return;
    }
  }
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-2xl font-bold">Add Category</h2>
      <Input
        name="category_name"
        placeholder="Category Name"
        value={inputNewCategory}
        onChange={(e) => setInputNewCategory(e.target.value)}
        className="max-w-64"
      />
      <Select
        name="categoryGroup"
        className="my-1 max-w-48"
        value={categoryGroupId}
        defaultValue=""
        onChange={(e) => setCategoryGroupId(Number(e.target.value))}
      >
        <option value="" disabled>
          Select a group&hellip;
        </option>
        {!isPlainAppError(categoryGroups) &&
          categoryGroups.map((group) =>
            group.name === "Inflow" ? null : (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ),
          )}
      </Select>
      <Button onClick={handleAddCategory}> Add </Button>
    </section>
  );
}
