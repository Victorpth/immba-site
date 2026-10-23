import { safeNextPath } from "@/lib/auth-path";
import { createSupabaseAuthServer } from "@/lib/supabase-auth";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const otpTypes = new Set<EmailOtpType>(["signup", "invite", "magiclink", "recovery", "email", "email_change"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next")) ?? "/en/login";

  try {
    const supabase = await createSupabaseAuthServer();
    const code = url.searchParams.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    }

    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    if (tokenHash && type && otpTypes.has(type as EmailOtpType)) {
      const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    }
  } catch {
    return NextResponse.redirect(new URL("/en/login?error=auth", url.origin));
  }

  return NextResponse.redirect(new URL("/en/login?error=auth", url.origin));
}
