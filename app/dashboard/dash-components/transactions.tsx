import { isPlainAppError, PlainAppError } from "@/errors";
import { Transaction, CategoryWithDetails } from "@/types/types";

import CategoryListBox from "./categoryListbox";

type TransactionsDisplayProps = {
  transactions: Transaction[] | PlainAppError;
  categoriesWithDetails: CategoryWithDetails[] | PlainAppError;
};

export default function TransactionsDisplay({
  transactions,
  categoriesWithDetails,
}: TransactionsDisplayProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Transactions</h2>
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
