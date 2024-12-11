import { CategoryWithDetails } from "@/types";
import {
  AddCategoryModal,
  UpdateAssignedModal,
  UpdateCategoryNameModal,
  UpdateGoalModal,
} from "./updateCategoryModals";
import { use } from "react";
import { isPlainAppError, PlainAppError } from "@/errors";

type CategoriesTableProps = {
  categoriesWithDetailsPromise: Promise<CategoryWithDetails[] | PlainAppError>;
  monthlyBudgetId: number;
};

export default function CategoriesTable({
  categoriesWithDetailsPromise,
  monthlyBudgetId,
}: CategoriesTableProps) {
  const categoriesWithDetails = use(categoriesWithDetailsPromise);

  if (isPlainAppError(categoriesWithDetails)) {
    return (
      <div>
        Error fetching categories. Try reloading the page, or logging out and in
        again.
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="overflow mb-4 w-full">
        <div className="mb-2">
          <AddCategoryModal />
        </div>
        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 rounded-t bg-slate-400 p-4 dark:bg-slate-800">
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Assigned</div>
          <div className="font-semibold">Spent</div>
          <div className="font-semibold">Goal</div>
        </div>

        {/* Table Rows */}
        {Array.isArray(categoriesWithDetails) &&
          categoriesWithDetails.map((c) => {
            if (c.name === "Ready to Assign") {
              return null;
            }
            return (
              <div
                key={c.id}
                className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 bg-gray-100 p-4 dark:bg-black"
              >
                <UpdateCategoryNameModal category={c} />
                <div>
                  <UpdateAssignedModal
                    c={c}
                    monthlyBudgetId={monthlyBudgetId}
                  />
                </div>
                <div>
                  $
                  {c.monthly_category_details === null ||
                  c.monthly_category_details?.amount_spent === null
                    ? "0"
                    : c.monthly_category_details?.amount_spent === 0
                      ? "0"
                      : c.monthly_category_details?.amount_spent !== null &&
                          c.monthly_category_details?.amount_spent % 1 === 0
                        ? c.monthly_category_details?.amount_spent
                        : c.monthly_category_details?.amount_spent !== null
                          ? c.monthly_category_details.amount_spent.toFixed(2)
                          : "0"}
                </div>
                <div>
                  <UpdateGoalModal c={c} />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
