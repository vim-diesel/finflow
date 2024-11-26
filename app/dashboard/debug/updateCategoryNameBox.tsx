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
import { set } from "zod";

export default function UpdateCategoryNameBox({
  category,
  handler,
}: {
  category: CategoryWithDetails;
  handler: (categoryId: number, newName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputName, setInputName] = useState(category.name);

  return (
    <>
      <Button
        type="button"
        className="w-max max-w-56 gap-0 px-2 py-1"
        outline
        onClick={() => setIsOpen(true)}
      >
        <span className=" truncate">{category.name}</span>
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
                className: "dark:text-white dark:bg-gray-700",
                position: "top-center",
                action: (
                  <Button color="red">
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
              handler(category.id, inputName);
            }}
          >
            Set
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
