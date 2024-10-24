"use server";
import { createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";



// Server Action to fetch transactions
export async function getBudgets() {
  const supabase = createClientServer();
  
  const { data: budgets, error } = await supabase.from("budgets").select("*");

  if (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }

  revalidatePath("/dashboard");
  return budgets;
}
