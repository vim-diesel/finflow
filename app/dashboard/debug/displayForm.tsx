"use client";
import React from "react";

import {
  Budget,
  CategoryGroup,
  CategoryWithDetails,
  MonthlyBudget,
  Transaction,
} from "@/types/types";

import { toast } from "sonner";
import { isPlainAppError, PlainAppError } from "@/errors";
import { addCategory, addTransaction, deleteCategory, updateCategoryName, updateMonthlyGoal } from "@/actions";
import { Button } from "@/components/button";
import { RadioField, RadioGroup } from "@/components/radio";
import { Radio } from "@/components/radio";
import { Label } from "@headlessui/react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Select } from "@/components/select";
import { Input, InputGroup } from "@/components/input";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { DateType } from "@/components/input";
import { updateAssigned } from "@/actions/monthlyCategoryDetails";
import UpdateCategoryNameBox from "./updateCategoryNameBox";
import UpdateAssignedBox from "./updateAssignedBox";
import UpdateGoalBox from "./updateGoalBox";

interface DebugPageProps {
  budget: Budget | PlainAppError;
  categoryWithDetails: CategoryWithDetails[] | PlainAppError;
  monthlyBudget: MonthlyBudget | PlainAppError;
  transactions: Transaction[] | PlainAppError;
  categoryGroups: CategoryGroup[] | PlainAppError;
}

const getCategoryGroupById = (
  categoryGroupId: number,
  categoryGroups: CategoryGroup[],
): CategoryGroup | undefined => {
  return categoryGroups.find((group) => group.id === categoryGroupId);
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// app/debug/page.tsx
export default function DisplayForm({
  budget,
  categoryWithDetails,
  monthlyBudget,
  transactions,
  categoryGroups,
}: DebugPageProps) {
  const [loading, setLoading] = React.useState(false);
  const [inputNewCategory, setInputNewCategory] = React.useState<string>("");
  const [inputAmount, setInputAmount] = React.useState<string>("");
  const [transactionType, setTransactionType] =
    React.useState<string>("inflow");
  const [categoryGroupId, setCategoryGroupId] = React.useState<number>();
  const [date, setDate] = React.useState<DateType>(getCurrentDate());

  async function handleAddCategory() {
    console.log("Adding category...", inputNewCategory, categoryGroupId);
    setLoading(true);
    if (!inputNewCategory) {
      toast.warning("Enter category name first...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }
    if (!categoryGroupId) {
      toast.warning("Select a category group first...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }
    const res = await addCategory(inputNewCategory, categoryGroupId);
    if (res?.error) {
      const errStr = `Error adding category: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    } else {
      toast.success("Category added successfully!");
      setInputNewCategory("");
      setLoading(false);
      return;
    }
  }

  async function handleAddTransaction(input: string, type: string) {
    setLoading(true);
    const amount = Number(input);

    if (isNaN(amount)) {
      toast.warning("Amount must be a number...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    } else if (!type || (type !== "inflow" && type !== "outflow")) {
      toast.warning("Invalid transaction type...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }

    if (!budget || isPlainAppError(budget)) {
      toast.error("Budget is not defined or is an error", {
        className: "bg-rose-500",
      });
      setLoading(false);
      return;
    }

    const response = await addTransaction(
      budget.id,
      Number(amount),
      transactionType as "inflow" | "outflow",
    );

    if (response?.error) {
      const errStr = `Error adding transaction: ${response.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    }

    toast.success("Transaction added successfully!");
    setInputAmount("");
    setLoading(false);
    return;
  }

  async function handleAssignDollars(
    categoryDetailsId: number,
    assignedAmount: number,
  ) {
    setLoading(true);
    if (!monthlyBudget || isPlainAppError(monthlyBudget)) {
      toast.error("Monthly budget is not defined or is an error", {
        className: "bg-rose-500",
      });
      setLoading(false);
      return;
    }
    const amount = Number(assignedAmount.toFixed(2));
    if (isNaN(assignedAmount)) {
      toast.warning("Amount must be a number...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    }
    const res = await updateAssigned(
      monthlyBudget.id,
      categoryDetailsId,
      amount,
    );

    if (isPlainAppError(res)) {
      const errStr = `Error updating assigned dollars: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    } else {
      toast.success("Updated!");
      setLoading(false);
      return;
    }
  }

  async function handleUpdateGoal(categoryId: number, amount: number) {
    setLoading(true);
    const res = await updateMonthlyGoal(categoryId, amount);
    if (res?.error) {
      const errStr = `Error updating goal: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    } else {
      toast.success("Goal updated successfully!");
      setLoading(false);
      return;
    }
  }

  async function handleUpdateCategoryName(catId: number, newName: string) {
    console.log("Updating category name...", catId, newName);
    setLoading(true);
    const res = await updateCategoryName(catId, newName);
    if (res?.error) {
      const errStr = `Error updating category name: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    } else {
      toast.success("Category name updated successfully!");
      setLoading(false);
      return;
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    console.log("Deleting category...", categoryId);
    setLoading(true);
    const res = await deleteCategory(categoryId);
    if (res?.error) {
      const errStr = `Error deleting category: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      setLoading(false);
      return;
    } else {
      toast.success("Category deleted successfully!");
      setLoading(false);
      return;
    }
  }

  return (
    <div className="sm:p-4">
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Budget</h2>
        {!isPlainAppError(budget) && (
          <DescriptionList>
            <DescriptionTerm>Budget Name</DescriptionTerm>
            <DescriptionDetails>{budget.name}</DescriptionDetails>
          </DescriptionList>
        )}
      </section>
      <Divider className="my-6" />
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Current Monthly Budget</h2>
        {!isPlainAppError(monthlyBudget) && (
          <DescriptionList>
            <DescriptionTerm>Month</DescriptionTerm>
            <DescriptionDetails>{monthlyBudget.month}</DescriptionDetails>
            <DescriptionTerm>Available</DescriptionTerm>
            <DescriptionDetails>{monthlyBudget.available}</DescriptionDetails>
          </DescriptionList>
        )}
      </section>
      <Divider className="my-6" />
      {/*
          *
          *
          TODO: Fade $0 amounts, make them clickable to pop up a modal to edit
          *
          *
      */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Categories With Details</h2>
        <div className="mb-4 w-full overflow">
          {/* Table Header */}
          <div className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
            <div className="font-semibold">Name</div>
            <div className="font-semibold">Assigned</div>
            <div className="font-semibold">Spent</div>
            <div className="font-semibold">Goal</div>
          </div>

          {/* Table Rows */}
          {Array.isArray(categoryWithDetails) &&
            categoryWithDetails.map((c) => {
              if (c.name === "Ready to Assign") {
                return null;
              }
              return (
                <div
                  key={c.id}
                  className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 rounded bg-gray-100 p-4 dark:bg-black"
                >
                  <UpdateCategoryNameBox
                    category={c}
                    handlerUpdate={handleUpdateCategoryName}
                    handlerDelete={handleDeleteCategory}
                  />
                  <div>
                    <UpdateAssignedBox c={c} handler={handleAssignDollars} />
                  </div>
                    <div>
                      $
                      {
                      c.monthly_category_details === null || c.monthly_category_details?.amount_spent === null 
                      ? "0"
                      : c.monthly_category_details?.amount_spent === 0
                      ? "0"
                      : c.monthly_category_details?.amount_spent !== null && c.monthly_category_details?.amount_spent % 1 === 0
                      ? c.monthly_category_details?.amount_spent
                      : c.monthly_category_details?.amount_spent !== null ? c.monthly_category_details.amount_spent.toFixed(2) : "0"}
                    </div>
                    <div>
                      <UpdateGoalBox c={c} handler={handleUpdateGoal} />

                    </div>
                </div>
              );
            })}
        </div>
      </section>
      <Divider className="my-6" />
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
        <div className="mb-4 w-full">
          {/* Table Header */}
          <div className="mb-2 grid grid-cols-3 gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
            <div className="font-semibold">Date</div>
            <div className="font-semibold">Amount</div>
            <div className="font-semibold">Type</div>
          </div>

          {/* Table Rows */}
          {Array.isArray(transactions) &&
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="mb-2 grid grid-cols-3 gap-4 rounded bg-gray-100 p-4 dark:bg-black"
              >
                <div>{tx.date}</div>
                <div>{tx.amount}</div>
                <div>{tx.transaction_type}</div>
              </div>
            ))}
        </div>
      </section>
      <Divider className="my-6" />
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
      <Divider className="my-6" />
      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-bold">Add Transaction</h2>
        <InputGroup>
          <CurrencyDollarIcon />
          <Input
            name="amount"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Amount"
            className="max-w-32"
          />
        </InputGroup>

        <RadioGroup
          name="transactionType"
          defaultValue="inflow"
          aria-label="Transaction Type"
          className="my-2 space-y-1"
          onChange={setTransactionType}
        >
          <RadioField>
            <Radio value="inflow" />
            <Label className="w-fit">Inflow</Label>
          </RadioField>
          <RadioField>
            <Radio value="outflow" />
            <Label className="w-fit">Outflow</Label>
          </RadioField>
        </RadioGroup>
        <Input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="my-2 max-w-32"
        />
        <Button
          onClick={() => handleAddTransaction(inputAmount, transactionType)}
        >
          Add
        </Button>
      </section>
      {loading && <div>Loading...</div>}
      <Divider className="my-6" />
      {/* <section className="mb-8">
        {Array.isArray(categoryWithDetails) &&
          categoryWithDetails.map((c) => (
            <div key={c.id}>
              <pre >{JSON.stringify(c, null, 2)}</pre>
              {!isPlainAppError(monthlyBudget) && (
                <p>Monthly budget id: {monthlyBudget.id}</p>
              )}
            </div>
          ))}
      </section> */}
    </div>
  );
}
