import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Category, CategoryWithDetails, Transaction } from "@/types";
import React from "react";

interface CategoryListProps {
  categories: CategoryWithDetails[] | null;
  tx: Transaction;
  handler(txId: number, catId: number): void;
}

const CategoryList: React.FC<CategoryListProps> = ({ tx, categories, handler }) => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    number | null
  >(tx.category_id);

  React.useEffect(() => {
    if (selectedCategoryId !== tx.category_id) {
      handler(tx.id, selectedCategoryId!);
    }
  }, [selectedCategoryId]);

  return (
    <Listbox
      name={`categoryList-${tx.id}`}
      placeholder="Select category&hellip;"
      value={selectedCategoryId}
      onChange={setSelectedCategoryId}
    >
      {categories &&
        categories.map((category) => (
          <ListboxOption key={category.id} value={category.id} >
            <ListboxLabel>{category.name}</ListboxLabel>
          </ListboxOption>
        ))}
    </Listbox>
  );
};

export default CategoryList;
