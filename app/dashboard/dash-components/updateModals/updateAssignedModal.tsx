"use client";

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
import { useState } from "react";

export function UpdateAssignedModal({
  c,
  handler,
}: {
  c: CategoryWithDetails;
  handler: (categoryId: number, oldAmount: number, newAmount: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedAmount, setAssignedAmount] = useState(
    c.monthly_category_details
      ? c.monthly_category_details.amount_assigned
      : "",
  );

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
                console.log("category id", c.id);
                console.log(
                  "old amount",
                  c.monthly_category_details?.amount_assigned ?? 0,
                );
                console.log("new amount", amount);
                handler(
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
