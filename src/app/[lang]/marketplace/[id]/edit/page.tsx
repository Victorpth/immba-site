import { MarketplaceListingForm } from "@/components/marketplace-listing-form";
import { PageIntro } from "@/components/page-intro";
import { ActionLink } from "@/components/site-links";
import { getAccess } from "@/lib/auth-access";
import { tx, isLang, withLang } from "@/lib/i18n";
import { isListingId } from "@/lib/marketplace-record";
import { getListing } from "@/lib/marketplace-server";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Edit listing", zh: "編輯刊登" };
const description = {
  en: "Update your marketplace listing, including how many copies remain.",
  zh: "修改你的教材市集刊登，包括剩餘數量。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }) {
  return pageMeta(params, title, description);
}

export default async function EditListingPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params;
  if (!isLang(raw) || !isListingId(id)) notFound();
  const lang = raw;
  const access = await getAccess();

  if (access.status !== "authenticated") {
    return (
      <>
        <PageIntro
          lang={lang}
          eyebrow={{ en: "Marketplace", zh: "教材市集" }}
          title={{ en: "Sign in to edit.", zh: "登入後才能編輯。" }}
          lede={{
            en: "Sign in with the account that published this listing, then open it again.",
            zh: "請用刊登這則教材的帳號登入，然後重新開啟。",
          }}
        />
        <section className="site-wrap py-14">
          <ActionLink href={withLang(lang, "/login")}>{tx(lang, { en: "Sign in", zh: "登入" })}</ActionLink>
        </section>
      </>
    );
  }

  const listing = await getListing(id);
  if (!listing || listing.seller_id !== access.userId) notFound();

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Edit your listing.", zh: "編輯你的刊登。" }}
        lede={{
          en: "Change the price or the number still in stock. Removed listings stay off the public page.",
          zh: "可修改價格或剩餘庫存。下架後不會出現在公開頁面。",
        }}
      />
      <MarketplaceListingForm lang={lang} mode="update" listing={listing} needsProfile={false} />
    </>
  );
}
