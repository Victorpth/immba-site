import { PageIntro } from "@/components/page-intro";
import { signOut } from "@/lib/auth-actions";
import { getAccess, isStaff } from "@/lib/auth-access";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound, redirect } from "next/navigation";

const title = { en: "Waiting for approval", zh: "等待核准" };
const description = {
  en: "This account cannot open the back office until a super admin approves it.",
  zh: "這個帳號要等超級管理員核准後，才能進入後台。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function PendingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const access = await getAccess();
  if (access.status === "anonymous") redirect(`/${lang}/login`);
  if (isStaff(access)) redirect(`/${lang}/admin/faculty`);

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Back office", zh: "後台" }}
        title={{ en: "Waiting for approval.", zh: "等待核准。" }}
        lede={{
          en: "The account exists, and its role is still pending. A super admin has to approve it before the faculty and announcement tools open.",
          zh: "帳號已經建立，角色仍是待核准。超級管理員核准之後，才能使用師資與公告工具。",
        }}
      />
      <div className="site-wrap max-w-xl py-14">
        {access.email ? <p className="text-sm text-[#243044]">{access.email}</p> : null}
        <form action={signOut} className="mt-6">
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-ink"
          >
            {tx(lang, { en: "Sign out", zh: "登出" })}
          </button>
        </form>
      </div>
    </>
  );
}
