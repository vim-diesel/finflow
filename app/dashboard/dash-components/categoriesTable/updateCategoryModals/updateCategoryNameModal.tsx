"use client";

import { deleteCategory, updateCategoryName } from "@/actions";
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
import { toast } from "sonner";

export function UpdateCategoryNameModal({
  category,
}: {
  category: CategoryWithDetails;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputName, setInputName] = useState(category.name);


  async function handleUpdateCategoryName(categoryId: number, newName: string) {
    const res = await updateCategoryName(categoryId, newName);
    if (res?.error) {
      const errStr = `Error updating category name: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Category name updated successfully!");
      return;
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    const res = await deleteCategory(categoryId);
    if (res?.error) {
      const errStr = `Error deleting category: ${res.error.message}`;
      toast.error(errStr, { className: "bg-rose-500" });
      return;
    } else {
      toast.success("Category deleted successfully!");
      return;
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUpdateCategoryName(category.id, inputName);
      setIsOpen(false);
    }
  }


  return (
    <>
      <Button
        type="button"
        className="w-max max-w-56 gap-0 px-2 py-1"
        outline
        onClick={() => setIsOpen(true)}
      >
        <span className="truncate">{category.name}</span>
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Edit</DialogTitle>
        <DialogDescription>Edit your category</DialogDescription>
        <DialogBody>
          <Field>
            <Label>Amount</Label>
            <Input
              name="amount"
              placeholder="$0.00"
              autoFocus
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button
            color="red"
            onClick={() => {
              setIsOpen(false);
              const toastStr = `Delete category "${category.name}"?`;
              toast(toastStr, {
                className: "w-full dark:text-white dark:bg-gray-700",
                position: "top-left",
                action: (
                  <Button
                    color="red"
                    onClick={() => {
                      handleDeleteCategory(category.id);
                      toast.dismiss();
                    }}
                  >
                    Delete
                  </Button>
                ),
                cancel: <Button onClick={() => toast.dismiss()}>Cancel</Button>,
              });
            }}
          >
            Delete
          </Button>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              handleUpdateCategoryName(category.id, inputName);
            }}
          >
            Set
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
