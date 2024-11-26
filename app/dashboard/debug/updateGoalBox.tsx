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

export default function UpdateGoalBox({
  c,
  handler,
}: {
  c: CategoryWithDetails;
  handler: (categoryId: number, amount: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [goalAmount, setGoalAmount] = useState(
    c.target_amount as unknown as string,
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
        {c.target_amount === 0
          ? "0"
          : c.target_amount !== null && c.target_amount % 1 === 0
            ? c.target_amount
            : c.target_amount !== null
              ? c.target_amount.toFixed(2)
              : "0"}
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
              value={goalAmount !== null ? goalAmount.toString() : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                  setGoalAmount(value);
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
              const amount = parseFloat(goalAmount);
              if (!isNaN(amount) && amount >= 0) {
                handler(c.id, amount);
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
