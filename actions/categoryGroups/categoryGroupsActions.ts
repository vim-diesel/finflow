"use server";

import { AppError, PlainAppError } from "@/errors";
import { CategoryGroup } from "@/types";
import { createServersideClient } from "@/utils/supabase/server";

export async function getCategoryGroups(
  budgetId: number,
): Promise<CategoryGroup[] | PlainAppError> {
  const supabase = createServersideClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    console.error("Error authenticating user: ", authError?.message);
    return new AppError({
      name: "AUTH_ERROR",
      message: "User authentication failed or user not found",
      code: authError?.code,
      status: authError?.status,
    }).toPlainObject();
  }

  const { data, error } = await supabase
    .from("category_groups")
    .select("*")
    .eq("budget_id", budgetId)
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Error fetching category groups: ", error);
    return new AppError({
      name: "DB_ERROR",
      message: error.message,
      code: error.code,
      status: 500,
    }).toPlainObject();
  }

  return data;
}