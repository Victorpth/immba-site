import { AuthLoginForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";
import { getAccess, isStaff } from "@/lib/auth-access";
import { safeNextPath } from "@/lib/auth-path";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound, redirect } from "next/navigation";

const title = { en: "Sign in", zh: "登入" };
const description = {
  en: "Sign in to the imMBA back office.",
  zh: "登入國際經管後台。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const query = await searchParams;
  const next = safeNextPath(query.next);

  const access = await getAccess();
  if (isStaff(access)) redirect(next?.startsWith(`/${lang}/admin`) ? next : `/${lang}/admin/news`);
  if (access.status === "authenticated") redirect(`/${lang}/pending`);

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Back office", zh: "後台" }}
        title={{ en: "Sign in.", zh: "登入。" }}
        lede={{
          en: "Faculty and announcement tools are limited to approved accounts.",
          zh: "師資與公告工具只開放給已核准的帳號。",
        }}
      />
      <AuthLoginForm lang={lang} next={next} callbackFailed={query.error === "auth"} />
    </>
  );
}
