import { getTransactions } from "./actions";
import { Database } from "@/database.types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default async function Page() {

  const transactions: Transaction[] = await getTransactions();

  return (
    <div>
      <h1>Transactions</h1>
      {/* Render transactions here */}
      {transactions.map((transaction) => (
        <div key={transaction.id}>{transaction.payee} : ${transaction.amount}</div>
      ))}
    </div>
  );
}