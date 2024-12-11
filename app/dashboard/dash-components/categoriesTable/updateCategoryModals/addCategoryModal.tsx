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

export function AddCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  const handleInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value);
  };

  return (
    <>
      <Button
        type="button"
        className="w-max max-w-56 gap-0 px-2 py-1"
        outline
        onClick={() => setIsOpen(true)}
      >
        <PlusCircleIcon /> Create category
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Create Cateogry</DialogTitle>
        <DialogDescription>Add a new category</DialogDescription>
        <DialogBody>
          <Field>
            <Label>Name</Label>
            <Input name="name" value={inputName} onChange={handleInputName} />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
