import { AdminPendingUsers } from "@/components/admin-pending-users";
import { PageIntro } from "@/components/page-intro";
import { getAccess, listPendingAccounts } from "@/lib/auth-access";
import { tx, isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound, redirect } from "next/navigation";

const title = { en: "Accounts", zh: "帳號" };
const description = {
  en: "Approve or reject accounts waiting for back-office access.",
  zh: "核准或拒絕等待進入後台的帳號。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const access = await getAccess();
  if (access.status === "anonymous") redirect(`/${lang}/login`);
  if (access.role !== "super_admin") redirect(`/${lang}/admin/news`);

  let people: Awaited<ReturnType<typeof listPendingAccounts>> = [];
  let unavailable = false;
  try {
    people = await listPendingAccounts();
  } catch {
    unavailable = true;
  }

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Super admin", zh: "超級管理員" }}
        title={{ en: "Accounts waiting for approval.", zh: "等待核准的帳號。" }}
        lede={{
          en: "Approving sets the role to admin. Rejecting deletes the account. Both happen on the server.",
          zh: "核准會把角色改成管理員。拒絕會刪除帳號。兩件事都只在伺服器上進行。",
        }}
      />
      <section className="site-wrap py-14">
        {unavailable ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            {tx(lang, { en: "The account list is unavailable right now.", zh: "帳號名單目前無法載入。" })}
          </p>
        ) : (
          <AdminPendingUsers lang={lang} people={people} />
        )}
      </section>
    </>
  );
}
