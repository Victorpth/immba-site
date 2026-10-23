import { AuthForgotForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Forgot password", zh: "忘記密碼" };
const description = {
  en: "Request a link to reset the back-office password.",
  zh: "取得重設後台密碼的連結。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Back office", zh: "後台" }}
        title={{ en: "Forgot your password?", zh: "忘記密碼了嗎？" }}
        lede={{
          en: "Enter the account email. If it exists, the reset link arrives there.",
          zh: "輸入帳號的電子郵件。如果帳號存在，重設連結會寄到那裡。",
        }}
      />
      <AuthForgotForm lang={lang} />
    </>
  );
}
