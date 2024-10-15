"use server";
import { createServerComponentClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function actionLoginUser({ email, password }: { email: string; password: string }) {
  const supabase = createServerComponentClient();
  const response = await supabase.auth.signInWithPassword({ email, password });
  return response;
}

export async function actionSignUpUser({ email, password }: { email: string; password: string }) {
  const supabase = createServerComponentClient();
  const { data } = await supabase.from("profiles").select("*").eq("email", email);
  if (data?.length) return { error: { message: "User already exists", data } };
  const response = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback` },
  });
  return response;
}
