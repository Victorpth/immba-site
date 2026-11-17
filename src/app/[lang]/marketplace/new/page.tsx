import { MarketplaceListingForm } from "@/components/marketplace-listing-form";
import { PageIntro } from "@/components/page-intro";
import { ActionLink } from "@/components/site-links";
import { getAccess } from "@/lib/auth-access";
import { tx, isLang, withLang } from "@/lib/i18n";
import { getMarketplaceProfile } from "@/lib/marketplace-server";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Sell a book", zh: "出售教材" };
const description = {
  en: "Publish a book or course material for sale on the imMBA marketplace.",
  zh: "在國際經管教材市集刊登書籍或上課教材。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function NewListingPage({ params }: { params: Promise<{ lang: string }> }) {
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
          title={{ en: "Sign in to sell.", zh: "登入後才能出售。" }}
          lede={{
            en: "Selling uses your account. Sign in, then open Sell again from the marketplace.",
            zh: "出售需要使用你的帳號。請先登入，再從教材市集重新開啟「出售」。",
          }}
        />
        <section className="site-wrap py-14">
          <ActionLink href={withLang(lang, "/login")}>{tx(lang, { en: "Sign in", zh: "登入" })}</ActionLink>
        </section>
      </>
    );
  }

  let needsProfile = true;
  let buyer = false;
  try {
    const profile = await getMarketplaceProfile(access.userId);
    needsProfile = !profile;
    buyer = profile?.role === "buyer";
  } catch {
    needsProfile = true;
  }

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Sell a book or course material.", zh: "出售書籍或上課教材。" }}
        lede={{
          en: "The listing appears on the marketplace. Set how many copies you still have.",
          zh: "刊登會出現在教材市集。請填寫目前還有的數量。",
        }}
      />
      {buyer ? (
        <p className="site-wrap pt-8 text-sm text-muted-foreground">
          {tx(lang, {
            en: "This account can buy. Publishing a listing also lets it sell.",
            zh: "此帳號可以購買。刊登後也可以出售。",
          })}
        </p>
      ) : null}
      <MarketplaceListingForm lang={lang} mode="create" listing={null} needsProfile={needsProfile} />
    </>
  );
}
