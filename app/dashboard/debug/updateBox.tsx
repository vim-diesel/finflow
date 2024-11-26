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

export default function UpdateBox({
  c,
  handler,
}: {
  c: CategoryWithDetails;
  handler: (categoryId: number, amount: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedAmount, setAssignedAmount] = useState(
    c.monthly_category_details?.amount_assigned
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
        {c.monthly_category_details &&
          c.monthly_category_details.amount_assigned}
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
              value={assignedAmount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(Number(value))) {
                  setAssignedAmount(Number(value));
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
              if (assignedAmount !== null && assignedAmount >= 0) {
                handler(c.id, assignedAmount);
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
