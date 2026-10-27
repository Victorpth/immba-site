"use server";

import { getAccess, isStaff } from "@/lib/auth-access";
import { formLang, safeNextPath } from "@/lib/auth-path";
import { createSupabaseAuthServer } from "@/lib/supabase-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthFormState = { error?: string; message?: string };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function password(formData: FormData) {
  const value = formData.get("password");
  return typeof value === "string" ? value : "";
}

function validEmail(value: string) {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPassword(value: string) {
  return value.length >= 8 && value.length <= 72;
}

async function requestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host || /[\s/]/.test(host) || (proto !== "http" && proto !== "https")) return null;
  return `${proto}://${host}`;
}

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const lang = formLang(formData.get("lang"));
  const email = text(formData, "email");
  const passwordValue = password(formData);
  if (!validEmail(email) || !validPassword(passwordValue)) return { error: "invalid_credentials" };

  try {
    const supabase = await createSupabaseAuthServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwordValue });
    if (error) return { error: "invalid_credentials" };
  } catch {
    return { error: "auth_failed" };
  }

  const access = await getAccess();
  if (!isStaff(access)) redirect(`/${lang}/pending`);

  const next = safeNextPath(text(formData, "next"));
  redirect(next?.startsWith(`/${lang}/admin`) ? next : `/${lang}/admin/faculty`);
}

export async function signUp(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const lang = formLang(formData.get("lang"));
  const email = text(formData, "email");
  const passwordValue = password(formData);
  if (!validEmail(email)) return { error: "invalid_email" };
  if (!validPassword(passwordValue)) return { error: "weak_password" };

  const origin = await requestOrigin();
  if (!origin) return { error: "auth_failed" };

  try {
    const supabase = await createSupabaseAuthServer();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordValue,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/${lang}/pending`)}`,
      },
    });
    if (error) return { error: "auth_failed" };
    if (!data.session) return { message: "check_email" };
  } catch {
    return { error: "auth_failed" };
  }

  redirect(`/${lang}/pending`);
}

export async function requestPasswordReset(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const lang = formLang(formData.get("lang"));
  const email = text(formData, "email");
  if (!validEmail(email)) return { error: "invalid_email" };

  const origin = await requestOrigin();
  if (!origin) return { error: "auth_failed" };

  try {
    const supabase = await createSupabaseAuthServer();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/${lang}/reset-password`)}`,
    });
    if (error) return { error: "auth_failed" };
  } catch {
    return { error: "auth_failed" };
  }

  return { message: "reset_sent" };
}

export async function updatePassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const lang = formLang(formData.get("lang"));
  const passwordValue = password(formData);
  if (!validPassword(passwordValue)) return { error: "weak_password" };

  try {
    const supabase = await createSupabaseAuthServer();
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) return { error: "reset_session" };
    const { error } = await supabase.auth.updateUser({ password: passwordValue });
    if (error) return { error: "auth_failed" };
  } catch {
    return { error: "auth_failed" };
  }

  const access = await getAccess();
  redirect(isStaff(access) ? `/${lang}/admin/faculty` : `/${lang}/pending`);
}

export async function signOut(formData: FormData) {
  const lang = formLang(formData.get("lang"));
  try {
    const supabase = await createSupabaseAuthServer();
    await supabase.auth.signOut();
  } catch {
    // Still leave the back office if the session is already gone.
  }
  redirect(`/${lang}/login`);
}
