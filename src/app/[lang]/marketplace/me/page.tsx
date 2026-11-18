import { MarketplaceMe } from "@/components/marketplace-me";
import { PageIntro } from "@/components/page-intro";
import { ActionLink } from "@/components/site-links";
import { getAccess } from "@/lib/auth-access";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "My orders", zh: "我的訂單" };
const description = {
  en: "Follow your purchases and move your sales one step at a time.",
  zh: "查看購買紀錄，並逐步處理你的銷售訂單。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function MarketplaceMePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const access = await getAccess();

  if (access.status !== "authenticated") {
    return (
      <>
        <PageIntro
          lang={lang}
          eyebrow={{ en: "Marketplace", zh: "教材市集" }}
          title={{ en: "Sign in to see your orders.", zh: "登入後才能查看訂單。" }}
          lede={{
            en: "Orders use your account. Sign in, then open My orders again.",
            zh: "訂單需要使用你的帳號。請先登入，再重新開啟「我的訂單」。",
          }}
        />
        <section className="site-wrap py-14">
          <ActionLink href={withLang(lang, "/login")}>{tx(lang, { en: "Sign in", zh: "登入" })}</ActionLink>
        </section>
      </>
    );
  }

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Orders and sales.", zh: "訂單與銷售。" }}
        lede={{
          en: "Buyers report a payment here. Sellers confirm it, then move each order one step forward.",
          zh: "買家在這裡回報付款。賣家確認後，每筆訂單一次只能往前一個步驟。",
        }}
      />
      <MarketplaceMe lang={lang} />
    </>
  );
}
