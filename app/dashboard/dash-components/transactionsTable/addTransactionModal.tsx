"use client";
import { Button } from "@/components/button";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { useState } from "react";

export function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState("");

  const handleInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
  };

  return (
    <>
      <Button
        type="button"
        className="w-max max-w-56 gap-0 px-2 py-1"
        outline
        onClick={() => setIsOpen(true)}
      >
        <PlusCircleIcon /> Add transaction
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Add Tx</DialogTitle>
        <DialogDescription>Create a new tx</DialogDescription>
        <DialogBody>
          <Field>
            <Label>Amount</Label>
            <Input name="name" value={inputAmount} onChange={handleInputName} placeholder="$0.00" />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
