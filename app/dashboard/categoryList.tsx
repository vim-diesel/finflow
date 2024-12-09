import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { CategoryWithDetails, Transaction } from "@/types";
import React from "react";

interface CategoryListProps {
  categories: CategoryWithDetails[] | null;
  tx: Transaction;
  handler(txId: number, catId: number): void;
}

const CategoryList: React.FC<CategoryListProps> = ({ tx, categories, handler }) => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(tx.category_id);

  const handleChange = (newCategoryId: number | null) => {
    setSelectedCategoryId(newCategoryId);
    if (newCategoryId !== tx.category_id) {
      handler(tx.id, newCategoryId!);
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

export default CategoryList;
