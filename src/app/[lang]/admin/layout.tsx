import { AdminNav } from "@/components/admin-nav";
import { signOut } from "@/lib/auth-actions";
import { getAccess, isStaff } from "@/lib/auth-access";
import { isLang, tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const access = await getAccess();
  if (access.status === "anonymous") redirect(`/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/news`)}`);
  if (!isStaff(access)) redirect(`/${lang}/pending`);

  return (
    <>
      <div className="border-b border-border bg-white">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <p className="text-[#243044]">{access.email}</p>
          <div className="flex flex-wrap items-center gap-4">
            {access.role === "super_admin" ? (
              <Link className="font-semibold underline underline-offset-2" href={withLang(lang, "/admin/users")}>
                {tx(lang, { en: "Accounts", zh: "帳號" })}
              </Link>
            ) : null}
            <form action={signOut}>
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className="font-semibold text-burgundy underline underline-offset-2">
                {tx(lang, { en: "Sign out", zh: "登出" })}
              </button>
            </form>
          </div>
        </div>
      </div>
      <AdminNav lang={lang} />
      {children}
    </>
  );
}
