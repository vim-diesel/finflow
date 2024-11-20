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
import { addCategory, addTransaction } from "@/actions";
import { Button } from "@/components/button";
import { RadioField, RadioGroup } from "@/components/radio";
import { Radio } from "../../../components/radio";
import { Label } from "@headlessui/react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Dropdown } from "@/components/dropdown";
import { Select } from "@/components/select";
import { Input } from "@/components/input";

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
  const [inputAmount, setInputAmount] = React.useState<number | string>("");
  const [transactionType, setTransactionType] = React.useState<string>("inflow");
  const [categoryGroupId, setCategoryGroupId] = React.useState<number>();

  const handleTransactionTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTransactionType(event.target.value as "inflow" | "outflow");
  };

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
      setLoading(false);
      return;
    }
  }

  async function handleAddTransaction(input: number | string, type: string) {
    setLoading(true);

    console.log("Adding transaction...", input, type);
    const amount = Number(input);
    if (!amount) {
      toast.warning("Enter your amount first...", {
        className: "bg-yellow-200",
      });
      setLoading(false);
      return;
    } else if (isNaN(Number(amount)) || amount === undefined) {
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

    if (isPlainAppError(budget)) {
      // this shouldn't happen, if there's an error, it should be handled in the
      // parent component and this component should not be rendered
      toast.error("Error getting the budget from server page component...");
      setLoading(false);
      return;
    }

    // budget cannot be undefined at this stage.
    const response = await addTransaction(
      budget!.id,
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
    setLoading(false);
    return;
  }

  return (
    <div className="sm:p-4">
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Budget</h2>
        {!isPlainAppError(budget) && (
          <DescriptionList>
            <DescriptionTerm>Budget ID</DescriptionTerm>
            <DescriptionDetails>{budget.id}</DescriptionDetails>
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

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Categories With Details</h2>
        <div className="mb-4 w-full">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
            <div className="font-semibold">Name</div>
            <div className="font-semibold">Assigned</div>
            <div className="font-semibold">Spent</div>
            <div className="font-semibold">Goal</div>
            <div className="font-semibold">Carryover</div>
          </div>

          {/* Table Rows */}
          {Array.isArray(categoryWithDetails) &&
            categoryWithDetails.map((c) => (
              <div
                key={c.id}
                className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 rounded bg-gray-100 p-4 dark:bg-black"
              >
                <div>{c.name}</div>
                <div>
                  {c.monthly_category_details &&
                    c.monthly_category_details.amount_assigned}
                </div>
                <div>
                  {c.monthly_category_details &&
                    c.monthly_category_details.amount_spent}
                </div>
                <div>{c.target_amount}</div>
                <div>
                  {c.monthly_category_details &&
                    c.monthly_category_details.carryover_from_previous_month}
                </div>
              </div>
            ))}
        </div>
      </section>

      <Divider className="my-6" />

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
        <div className="mb-4 w-full">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
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
          name="category"
          placeholder="Category Name"
          onChange={(e) => setInputNewCategory(e.target.value)}
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
        <input
          type="input"
          name="amount"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Amount"
          className="mb-2 w-full rounded border p-2 dark:bg-gray-800"
        />
        <div className="my-2">
          <RadioGroup
            name="transactionType"
            defaultValue="inflow"
            aria-label="Transaction Type"
            className="space-y-1"
            onChange={setTransactionType}
          >
            <RadioField>
              <Radio value="inflow" />
              <Label>Inflow</Label>
            </RadioField>
            <RadioField>
              <Radio value="outflow" />
              <Label>Outflow</Label>
            </RadioField>
          </RadioGroup>
        </div>
        <Button
          onClick={() => handleAddTransaction(inputAmount, transactionType)}
        >
          Add
        </Button>
      </section>

      {loading && <div>Loading...</div>}
    </div>
  );
}
