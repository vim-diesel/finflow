import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const supabase = createClientServer();

// Server Action to fetch transactions
export async function getBudgets() {
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  revalidatePath('/dashboard','page')
  return budgets;
}
