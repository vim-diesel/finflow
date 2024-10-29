import { Fragment } from "react";
import { CategoryGroup, CategoryWithDetails } from "@/app/dashboard/types";

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function BudgetTable({
  categoryGroups,
  categories,
}: {
  categoryGroups: CategoryGroup[] | null;
  categories: CategoryWithDetails[] | null;
}) {
  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-200">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all the categories in your budget
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add category
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full">
              <thead className="bg-white dark:bg-black">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 dark:text-gray-200"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Assigned
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Available
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-600">
                {categoryGroups?.map((categoryGroup) => (
                  <Fragment key={categoryGroup.id}>
                    <tr className="border-t border-gray-200 ">
                      <th
                        scope="colgroup"
                        colSpan={5}
                        className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 dark:bg-gray-500 dark:text-gray-200"
                      >
                        {categoryGroup.name}
                      </th>
                    </tr>
                    {categories
                      ?.filter((category) => category.id === categoryGroup.id)
                      .map((category, categoryIdx) => (
                        <tr
                          key={category.id}
                          className={classNames(
                            categoryIdx === 0
                              ? "border-gray-300"
                              : "border-gray-200",
                            "border-t",
                          )}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3 dark:text-gray-200">
                            {category.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            $
                            {category.monthly_category_details
                              ?.amount_assigned ?? 0}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            $
                            {category.monthly_category_details?.amount_spent ??
                              0}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            $
                            {(category.monthly_category_details
                              ?.amount_assigned ?? 0) -
                              (category.monthly_category_details
                                ?.amount_spent ?? 0) +
                              (category.monthly_category_details
                                ?.carryover_from_previous_month ?? 0)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                            <a
                              href="#"
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-400"
                            >
                              Edit
                              <span className="sr-only">, {category.name}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
