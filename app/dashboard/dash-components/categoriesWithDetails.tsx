import { CategoryWithDetails } from "@/types";
import {
  UpdateAssignedModal,
  UpdateCategoryNameModal,
  UpdateGoalModal,
} from "./updateModals";
import { use } from "react";

type CategoriesDisplayProps = {
  categoriesWithDetailsPromise: Promise<CategoryWithDetails[] | PlainAppError>;
  monthlyBudgetId: number;
};

export default function CategoriesDisplay({
  categoriesWithDetailsPromise,
  monthlyBudgetId,
}: CategoriesDisplayProps) {
  const categoriesWithDetails = use(categoriesWithDetailsPromise);

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Categories With Details</h2>
      <div className="overflow mb-4 w-full">
        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
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
                className="mb-2 grid grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 rounded bg-gray-100 p-4 dark:bg-black"
              >
                <UpdateCategoryNameModal
                  category={c}
                />
                <div>
                  <UpdateAssignedModal c={c} monthlyBudgetId={monthlyBudgetId}/>
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
