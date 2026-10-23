import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLang } from "@/lib/i18n";

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

function applyHeaders(response: NextResponse, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const sessionCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const sessionHeaders: Record<string, string> = {};

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        sessionCookies.length = 0;
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = options as CookieOptions;
          sessionCookies.push({ name, value, options: cookieOptions });
          response.cookies.set(name, value, cookieOptions);
        });
        Object.assign(sessionHeaders, headers);
        applyHeaders(response, headers);
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const admin = pathname.match(/^\/(en|zh)\/admin(?:\/(.*))?$/);
  const lang = admin && isLang(admin[1]) ? admin[1] : null;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    sessionCookies.forEach(({ name, value, options }) => redirect.cookies.set(name, value, options));
    applyHeaders(redirect, sessionHeaders);
    return redirect;
  };

  try {
    const { data } = await supabase.auth.getUser();
    if (!lang) return response;
    if (!data.user) return redirectTo(`/${lang}/login?next=${encodeURIComponent(pathname)}`);

    // Optimistic role check with the user session. The admin layout checks again with the server secret.
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (error || !profile) return response;
    if (profile.role !== "admin" && profile.role !== "super_admin") return redirectTo(`/${lang}/pending`);

    const rest = admin?.[2] ?? "";
    if ((rest === "users" || rest.startsWith("users/")) && profile.role !== "super_admin") {
      return redirectTo(`/${lang}/admin/news`);
    }
    return response;
  } catch {
    if (!lang) return NextResponse.next();
    return redirectTo(`/${lang}/login?next=${encodeURIComponent(pathname)}`);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
