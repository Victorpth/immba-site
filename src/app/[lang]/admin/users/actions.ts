"use server";

import { getAccess, isAccountId } from "@/lib/auth-access";
import { formLang } from "@/lib/auth-path";
import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ReviewState = { error?: string };

export async function reviewAccount(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const lang = formLang(formData.get("lang"));
  const id = formData.get("id");
  const intent = formData.get("intent");
  if (typeof id !== "string" || !isAccountId(id)) return { error: "invalid_request" };
  if (intent !== "approve" && intent !== "reject") return { error: "invalid_request" };

  const access = await getAccess();
  if (access.status === "anonymous") return { error: "unauthorized" };
  if (access.role !== "super_admin") return { error: "forbidden" };
  if (access.userId === id) return { error: "forbidden" };

  try {
    const supabase = createSupabaseServer();
    const { data: profile, error: readError } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
    if (readError || profile?.role !== "pending") return { error: "not_pending" };

    if (intent === "approve") {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", id)
        .eq("role", "pending")
        .select("id")
        .maybeSingle();
      if (error || !data) return { error: "save_failed" };
    } else {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) return { error: "save_failed" };
    }
  } catch {
    return { error: "save_failed" };
  }

  revalidatePath(`/${lang}/admin/users`);
  return {};
}
