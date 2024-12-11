import { isPlainAppError, PlainAppError } from "@/errors";
import { Transaction, CategoryWithDetails } from "@/types/types";

import CategoryListBox from "./categoryListbox";
import { use } from "react";
import { AddTransactionModal } from "./addTransactionModal";

type TransactionsTableProps = {
  transactionsPromise: Promise<Transaction[] | PlainAppError>;
  categoriesWithDetailsPromise: Promise<CategoryWithDetails[] | PlainAppError>;
};

export default function TransactionsTable({
  transactionsPromise,
  categoriesWithDetailsPromise,
}: TransactionsTableProps) {
  const transactions = use(transactionsPromise);
  const categoriesWithDetails = use(categoriesWithDetailsPromise);

  if (isPlainAppError(transactions) || isPlainAppError(categoriesWithDetails)) {
    return (
      <div>
        Error fetching transactions. Try reloading the page, or logging out and
        in again.
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-2">
        <AddTransactionModal />
      </div>
      <div className="mb-4 w-full">
        {/* Table Header */}
        <div className="mb-2 grid grid-cols-5 gap-4 rounded-t bg-gray-200 p-4 dark:bg-gray-800">
          <div className="font-semibold">Date</div>
          <div className="font-semibold">TxID</div>
          <div className="justify-self-center font-semibold">Inflow</div>
          <div className="justify-self-center font-semibold">Outflow</div>
          <div className="font-semibold">Category</div>
        </div>

        {/* Table Rows */}
        {Array.isArray(transactions) &&
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="mb-2 grid grid-cols-5 items-center gap-4 rounded bg-gray-100 p-4 dark:bg-black"
            >
              <div>{tx.date}</div>
              <div>{tx.id}</div>
              <div className="justify-self-center">
                {tx.transaction_type === "inflow" && tx.amount}
              </div>
              <div className="justify-self-center">
                {tx.transaction_type === "outflow" && tx.amount}
              </div>
              <CategoryListBox
                tx={tx}
                categories={
                  isPlainAppError(categoriesWithDetails)
                    ? null
                    : categoriesWithDetails
                }
              />
            </div>
          ))}
      </div>
    </section>
  );
}
