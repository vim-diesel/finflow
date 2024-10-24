import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const supabase = createClientServer();

export async function getTransactions() {
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*");

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  revalidatePath("/dashboard/transactions", "page");
  return transactions;
}
