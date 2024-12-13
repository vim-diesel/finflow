"use server";

import { AppError, PlainAppError } from "@/errors";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/* User can add a transaction row. 

Date Handling: use only the date part of the ISO string to match 
schema's timestamp without time zone.

We don't return the data inserted into the table, just null.
*/

// Inputs:
// budgetId - the ID of the budget to add the transaction to (number)
// amount - the amount of the transaction (number)
// transactionType - the type of transaction (string)
// category - the ID of the category of the transaction (number)
// date - the date of the transaction (Date)
// note - the memo of the transaction (string)
// cleared - whether the transaction is cleared (boolean)
// payee - the payee of the transaction (string) (this will be its own table in the future)
//
// Output: null or a PlainAppError

// TODO: Zod validation.

export async function addTransaction(
  budgetId: number,
  amount: number,
  transactionType: "inflow" | "outflow",
  categoryId?: number | null,
  date?: Date | null,
  note?: string | null,
  cleared?: boolean | undefined,
  payee?: string | null,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { error } = await supabase.from("transactions").insert({
    budget_id: budgetId,
    amount,
    transaction_type: transactionType,
    category_id: categoryId || null,
    date: date
      ? date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    note: note || "",
    cleared: cleared !== undefined ? cleared : true,
    payee: payee || null,
    user_id: user.id,
  });

  if (error) {
    console.error("Error inserting transaction: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  // Todo: Inflow
  // add the transaction amount to next monthlyBudget's available amount.
  // if the transaction is posted from a previous month, add it to the current month.

  // Todo: Outflow
  // Show the user the uncategorized spendings, and ask them to categorize it.
  //User needs to assign their available funds to categories to cover spending.

  revalidatePath("/dashboard");
  return null;
}

export async function updateTransaction(
  transactionId: number,
  updates: Partial<Transaction>,
): Promise<null | PlainAppError> {
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
      status: authError?.status,
    }).toPlainObject();
  }

  const { error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", transactionId);

  if (error) {
    console.error("Error updating transaction: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
      details: error.details,
    }).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}
