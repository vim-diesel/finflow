"use client";

import { updateAssigned } from "@/actions/monthlyCategoryDetails";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { isPlainAppError } from "@/errors";
import { CategoryWithDetails } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

export function UpdateAssignedModal({
  c,
  monthlyBudgetId,
}: {
  c: CategoryWithDetails;
  monthlyBudgetId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedAmount, setAssignedAmount] = useState(
    c.monthly_category_details
      ? c.monthly_category_details.amount_assigned
      : "",
  );

  async function handleUpdateAssigned(
    categoryId: number,
    oldAmount: number,
    newAmount: number,
  ) {
    if (!monthlyBudgetId) {
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
      monthlyBudgetId,
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

  return (
    <>
      <Button
        type="button"
        className="gap-0 px-2 py-1"
        outline
        onClick={() => setIsOpen(true)}
      >
        $
        {c.monthly_category_details === null
          ? 0
          : c.monthly_category_details?.amount_assigned === 0
            ? 0
            : c.monthly_category_details?.amount_assigned !== null &&
                c.monthly_category_details.amount_assigned % 1 === 0
              ? c.monthly_category_details.amount_assigned
              : (c.monthly_category_details?.amount_assigned?.toFixed(2) ?? 0)}
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Assign Dollars</DialogTitle>
        <DialogDescription>
          Assign your monthly available budget to {c.name}
        </DialogDescription>
        <DialogBody>
          <Field>
            <Label>Amount</Label>
            <Input
              name="amount"
              placeholder="$0.00"
              autoFocus
              value={assignedAmount !== null ? assignedAmount?.toString() : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                  setAssignedAmount(value);
                }
              }}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              const amount = parseFloat(assignedAmount?.toString() || "0");
              if (!isNaN(amount) && amount >= 0) {
                handleUpdateAssigned(
                  c.id,
                  c.monthly_category_details?.amount_assigned ?? 0,
                  amount,
                );
              }
            }}
          >
            Set
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
