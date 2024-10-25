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

// Server Action to fetch monthly budgets
export async function getMonthlyBudgets() {
  const supabase = createClientServer();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  // Ensure the dates are in UTC
  const firstDayOfMonthUTC = new Date(
    Date.UTC(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      firstDayOfMonth.getDate(),
    ),
  );
  const firstDayOfNextMonthUTC = new Date(
    Date.UTC(
      firstDayOfNextMonth.getFullYear(),
      firstDayOfNextMonth.getMonth(),
      firstDayOfNextMonth.getDate(),
    ),
  );

  const { data: monthlyBudgets, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .gte("month", firstDayOfMonthUTC.toISOString())
    .lt("month", firstDayOfNextMonthUTC.toISOString());

  if (error) {
    console.error("Error fetching monthly budgets:", error);
    return [];
  }

  console.log(monthlyBudgets);

  revalidatePath("/dashboard");
  return monthlyBudgets;
}
