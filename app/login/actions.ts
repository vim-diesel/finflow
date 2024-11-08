"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServersideClient } from "@/utils/supabase/server";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export async function login(email: string, password: string) {
  const supabase = createServersideClient();

  const validatedFields = LoginSchema.safeParse({ email, password });

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message, code: error.code };
  }

  revalidatePath("/dashboard", "page");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = createServersideClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    // Validate inputs
    LoginSchema.parse(data);
  } catch (error) {
    console.error("Validation error:", error);
    redirect("/error");
    return;
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { message: error.message, code: error.code };
  }

  revalidatePath("/dashboard", "page");
  redirect("/dashboard");
}
