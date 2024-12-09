"use client";

import { updateTransaction } from "@/actions";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { CategoryWithDetails, Transaction } from "@/types";
import React from "react";
import { toast } from "sonner";

interface CategoryListBoxProps {
  categories: CategoryWithDetails[] | null;
  tx: Transaction;
}

const CategoryListBox: React.FC<CategoryListBoxProps> = ({
  tx,
  categories,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    number | null
  >(tx.category_id);

  const handleChange = async (newCategoryId: number | null) => {
    setSelectedCategoryId(newCategoryId);
    if (newCategoryId !== tx.category_id) {
      const res = await updateTransaction(tx.id, { category_id: selectedCategoryId });
      if (res?.error) {
        const errStr = `Error updating transaction category: ${res.error.message}`;
        toast.error(errStr, { className: "bg-rose-500" });
        return;
      }
    }
  };

  return (
    <Listbox
      name={`categoryList-${tx.id}`}
      placeholder="Select category&hellip;"
      value={selectedCategoryId}
      onChange={handleChange}
    >
      {categories &&
        categories.map((category) => (
          <ListboxOption key={category.id} value={category.id}>
            <ListboxLabel>{category.name}</ListboxLabel>
          </ListboxOption>
        ))}
    </Listbox>
  );
};

export default CategoryListBox;
