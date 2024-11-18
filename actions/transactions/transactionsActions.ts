"use server";

import { AppError, PlainAppError } from "@/errors";
import { Transaction } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";
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
  categoryId?: number,
  date?: Date,
  note?: string,
  cleared?: boolean,
  payee?: string,
): Promise<null | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Return our custom error type if there is an auth error from Supabase
  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    ).toPlainObject();
  }

  // Validate amount
  if (amount < 0 || isNaN(amount)) {
    return new AppError(
      "VALIDATION_ERROR",
      "Transaction amount must be non-negative",
    ).toPlainObject();
  }

  // Validate transaction type
  if (transactionType !== "inflow" && transactionType !== "outflow") {
    return new AppError(
      "VALIDATION_ERROR",
      "Invalid transaction type",
    ).toPlainObject();
  }

  const { error } = await supabase.from("transactions").insert({
    budget_id: budgetId,
    user_id: user.id,
    amount,
    transaction_type: transactionType,
    category_id: categoryId || null,
    date: date
      ? date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    note: note || "",
    cleared: cleared !== undefined ? cleared : true,
    payee: payee || null,
  });

  if (error) {
    console.error("Error inserting transaction: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  revalidatePath("/dashboard");
  return null;
}

export async function getTransactions(
  budgetId: number,
): Promise<Transaction[] | PlainAppError> {
  const supabase = createServersideClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError(
      "AUTH_ERROR",
      "User authentication failed or user not found",
      authError?.code,
    ).toPlainObject();
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions: ", error);
    return new AppError("DB_ERROR", error.message, error.code).toPlainObject();
  }

  // revalidatePath("/dashboard");
  return transactions;
}