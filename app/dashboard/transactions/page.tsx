import { getTransactions } from "@/app/actions";
import { Database } from "@/database.types";
import { Heading } from "@/components/heading";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default async function Page() {
  const transactions: Transaction[] = await getTransactions();

  return (
    <div>
      <Heading level={3}>Transactions</Heading>
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          {transaction.payee} : ${transaction.amount}
        </div>
      ))}
    </div>
  );
}
