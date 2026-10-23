import { AuthSignupForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";
import { getAccess, isStaff } from "@/lib/auth-access";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound, redirect } from "next/navigation";

const title = { en: "Create an account", zh: "建立帳號" };
const description = {
  en: "Request access to the imMBA back office.",
  zh: "申請國際經管後台的使用權限。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const access = await getAccess();
  if (isStaff(access)) redirect(`/${lang}/admin/news`);
  if (access.status === "authenticated") redirect(`/${lang}/pending`);

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Back office", zh: "後台" }}
        title={{ en: "Create an account.", zh: "建立帳號。" }}
        lede={{
          en: "A new account stays pending until a super admin approves it. It cannot open the back office before that.",
          zh: "新帳號會先停在待核准，直到超級管理員核准。核准之前不能進入後台。",
        }}
      />
      <AuthSignupForm lang={lang} />
    </>
  );
}
