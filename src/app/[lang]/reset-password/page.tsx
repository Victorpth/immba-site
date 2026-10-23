import { AuthResetForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";
import { getAccess } from "@/lib/auth-access";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "Reset password", zh: "重設密碼" };
const description = {
  en: "Choose a new password for the back office.",
  zh: "為後台設定新密碼。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const access = await getAccess();

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Back office", zh: "後台" }}
        title={{ en: "Choose a new password.", zh: "設定新密碼。" }}
        lede={{
          en: "This page opens from the reset link in your email.",
          zh: "請從信裡的重設連結開啟這個頁面。",
        }}
      />
      {access.status === "anonymous" ? (
        <p className="site-wrap max-w-xl py-14 text-sm text-[#243044]">
          {tx(lang, { en: "The reset link is missing or has expired. ", zh: "重設連結不存在或已失效。" })}
          <Link className="underline underline-offset-2" href={withLang(lang, "/forgot-password")}>
            {tx(lang, { en: "Request a new link", zh: "重新取得連結" })}
          </Link>
        </p>
      ) : (
        <AuthResetForm lang={lang} />
      )}
    </>
  );
}
