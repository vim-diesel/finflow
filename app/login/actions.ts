'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string(),
  password: z.string()
})

export async function login(email: string, password: string) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  LoginSchema.parse({email,password});
  const data = {
    email: email,
    password: password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
