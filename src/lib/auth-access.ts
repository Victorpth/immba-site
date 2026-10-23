import "server-only";

import { createSupabaseAuthServer } from "@/lib/supabase-auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export type ProfileRole = "pending" | "admin" | "super_admin";
export type StaffRole = "admin" | "super_admin";

export type Access =
  | { status: "anonymous" }
  | { status: "authenticated"; userId: string; email: string | null; role: ProfileRole | null };

export type PendingAccount = {
  id: string;
  email: string | null;
  created_at: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asRole(value: unknown): ProfileRole | null {
  if (value === "pending" || value === "admin" || value === "super_admin") return value;
  return null;
}

export function isAccountId(value: string) {
  return uuidPattern.test(value);
}

// Confirms the cookie session with Supabase, then reads the role with the server secret.
export async function getAccess(): Promise<Access> {
  const auth = await createSupabaseAuthServer();
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) return { status: "anonymous" };

  const supabase = createSupabaseServer();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { status: "authenticated", userId: data.user.id, email: data.user.email ?? null, role: null };
  }

  return {
    status: "authenticated",
    userId: data.user.id,
    email: typeof profile.email === "string" ? profile.email : data.user.email ?? null,
    role: asRole(profile.role),
  };
}

export function isStaff(access: Access): access is Extract<Access, { status: "authenticated" }> & { role: StaffRole } {
  return access.status === "authenticated" && (access.role === "admin" || access.role === "super_admin");
}

export async function requireStaff(): Promise<
  | { ok: true; userId: string; role: StaffRole }
  | { ok: false; status: 401 | 403; error: "unauthorized" | "forbidden" }
> {
  const access = await getAccess();
  if (access.status === "anonymous") return { ok: false, status: 401, error: "unauthorized" };
  if (!isStaff(access)) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true, userId: access.userId, role: access.role };
}

export async function listPendingAccounts(): Promise<PendingAccount[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .eq("role", "pending")
    .order("created_at", { ascending: true });
  if (error || !data) throw new Error("Pending accounts could not be loaded.");

  return data.flatMap((row) => {
    const id = typeof row.id === "string" ? row.id : "";
    const createdAt = typeof row.created_at === "string" ? row.created_at : "";
    if (!isAccountId(id) || !createdAt) return [];
    return [{ id, email: typeof row.email === "string" ? row.email : null, created_at: createdAt }];
  });
}
