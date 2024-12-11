import { createMonthlyBudget } from "@/actions";
import { AppError, PlainAppError } from "@/errors";
import { MonthlyBudget } from "@/types";
import { createClient } from "@/utils/supabase/server";


// TODO: Run calculations to update the total available amount upon user login
/**
 * Retrieves the monthly budget for today based on the provided budget ID.
 * If the user is not authenticated or an error occurs during authentication,
 * an authentication error is returned. If no monthly budget is found for the
 * current month, a new monthly budget is created.
 *
 * @param {number} budgetId - The ID of the budget to retrieve.
 * @returns {Promise<MonthlyBudget | PlainAppError>} - The monthly budget for today or an error object.
 */
export async function getTodaysMonthlyBudget(
  budgetId: number,
): Promise<MonthlyBudget | PlainAppError> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code,
    }).toPlainObject();
  }

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Convert the date to UTC and format as YYYY-MM-DD
  const firstDayOfMonthUTC = new Date(firstDayOfMonth)
    .toISOString()
    .split("T")[0];

  // Fetch the current monthly budget
  const { data: monthlyBudget, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("month", firstDayOfMonthUTC)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no monthly budget found
      // create a monthly budget for the current month
      // TODO: and calculate available amount
      return createMonthlyBudget(budgetId, new Date());
    }
    console.error("Error fetching todays monthly budget: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      hint:
        typeof error.hint === "string"
          ? { message: error.hint }
          : error.hint || {
              budgetId,
              firstDayOfMonthUTC,
            },
    }).toPlainObject();
  }

  //revalidatePath("/dashboard/debug");
  return monthlyBudget;
}