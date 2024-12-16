"use client";
import { updateCategoryName } from "@/actions";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowTurnDownRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import Spinner from "@/components/ui/spinner";

export function CategoryNameInput({
  categoryName,
  categoryId,
}: {
  categoryName: string;
  categoryId: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(categoryName);
  const [saving, setSaving] = useState(false);
  const [lastSavedName, setLastSavedName] = useState(categoryName);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsFocused(false);
    inputRef.current?.blur();

    if (name === lastSavedName) {
      setSaving(false);
      return;
    } else if (name === "") {
      toast.error("Category name cannot be empty", {
        className: "bg-rose-300",
      });
      setName(lastSavedName);
      setSaving(false);
      return;
    }

    const res = await updateCategoryName(categoryId, name);

    if (res?.error) {
      toast.error(
        `Error updating category name: ${res.error.message} (${res.error.details})`,
        {
          className: "bg-rose-300",
        },
      );
      setName(lastSavedName);
    } else {
      setLastSavedName(name);
    }
    setSaving(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleBlur();
      setName(lastSavedName);
    } else if (e.key === "Enter") {
      handleBlur();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-gray-100 dark:bg-black"
    >
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          name="categoryName"
          value={name}
          disabled={saving}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="transition-all duration-200 lg:w-64 "
        />

        <div
          className={cn(
            "absolute left-0 top-full mt-1 w-max rounded border-[1px] border-dashed border-black bg-gray-200 p-2 text-xs shadow-lg transition-opacity duration-1000 dark:bg-gray-700",
            isFocused ? "visible opacity-100" : "invisible opacity-0",
          )}
        >
          Enter to save / Esc to cancel
        </div>
        <Button
          type="submit"
          color="green"
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "!absolute right-1 top-1/2 -translate-y-1/2",
            "transition-all duration-200",
            "h-6 w-6 p-1",
            !isFocused && "hidden",
          )}
        >
          <ArrowTurnDownRightIcon className="h-5 w-5" />
        </Button>
      </div>
      {saving && <Spinner />}
    </form>
  );
}
