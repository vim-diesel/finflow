"use client";

import { updateMonthlyGoal } from "@/actions";
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
import { CategoryWithDetails } from "@/types";
import React, { useState } from "react";
import { toast } from "sonner";

export function UpdateGoalModal({
  c,
}: {
  c: CategoryWithDetails;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [goalAmount, setGoalAmount] = useState<string | undefined>(
    c.target_amount?.toString() || "",
  );

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUpdateGoal(c.id, parseFloat(goalAmount || "0"));
      setIsOpen(false);
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
        {c.target_amount === 0
          ? "0"
          : c.target_amount !== null && c.target_amount % 1 === 0
            ? c.target_amount
            : c.target_amount !== null
              ? c.target_amount.toFixed(2)
              : "0"}
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Your Goal</DialogTitle>
        <DialogDescription>
          View and edit your goal for {c.name}
        </DialogDescription>
        <DialogBody>
          <Field>
            <Label>Amount</Label>
            <Input
              name="amount"
              placeholder="$0.00"
              autoFocus
              value={
                goalAmount === "0" || !goalAmount ? "" : goalAmount?.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                  setGoalAmount(value);
                }
              }}
              onKeyDown={handleKeyDown}
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
              const amount = parseFloat(goalAmount || "0");
              if (!isNaN(amount) && amount >= 0) {
                handleUpdateGoal(c.id, amount);
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
