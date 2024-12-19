"use client";

import { Input } from "@/components/input";
import { useState, useTransition } from "react";
import { updateAssigned } from "@/actions/monthlyCategoryDetails";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { ArrowTurnDownRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface UpdateAssignedInputProps {
  monthlyBudgetId: number;
  categoryId: number;
  assigned: number | null;
}

export default function UpdateAssignedInput({
  monthlyBudgetId,
  categoryId,
  assigned,
}: UpdateAssignedInputProps) {
  const [assignedInput, setAssignedInput] = useState<string>(
    assigned ? assigned?.toString() : "",
  );
  const [isPending, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!isNaN(Number(assignedInput)) && Number(assignedInput) >= 0) {
      startTransition(async () => {
        const res = await updateAssigned(
          monthlyBudgetId,
          categoryId,
          Number(assignedInput),
        );
        if (res?.error) {
          toast.error(
            `Error updating category name: ${res.error.message} (${res.error.details})`,
            {
              className: "bg-rose-300",
            },
          );
        }
      });
    }
  };

  return (
    <div className="flex items-center">
      <Input
        value={assignedInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setAssignedInput(e.target.value)}
      />
      <Button
        type="submit"
        color="green"
        onClick={handleSubmit}
        disabled={isPending}
        className={cn("h-6 w-6 p-1", !isFocused && "hidden")}
      >
        <ArrowTurnDownRightIcon className="h-5 w-5" />
      </Button>
    </div>
  );
}
