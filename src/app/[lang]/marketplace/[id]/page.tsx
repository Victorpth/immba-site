import { MarketplacePhoto } from "@/components/marketplace-photo";
import { MarketplacePurchase } from "@/components/marketplace-purchase";
import { PageIntro } from "@/components/page-intro";
import { TextLink } from "@/components/site-links";
import { getAccess } from "@/lib/auth-access";
import { tx, isLang, withLang } from "@/lib/i18n";
import { categoryLabel, conditionLabel, formatTwd, isListingId, stockLabel } from "@/lib/marketplace-record";
import { getListing } from "@/lib/marketplace-server";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Listing", zh: "刊登" };
const description = {
  en: "A book or course material for sale on the imMBA marketplace.",
  zh: "國際經管教材市集上的一則書籍或上課教材。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }) {
  return pageMeta(params, title, description);
}

export default async function ListingPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params;
  if (!isLang(raw) || !isListingId(id)) notFound();
  const lang = raw;
  const listing = await getListing(id);
  if (!listing || listing.status !== "active") notFound();
  const access = await getAccess();
  const itemTitle = lang === "zh" ? listing.title_zh : listing.title_en;
  const itemBody = lang === "zh" ? listing.description_zh : listing.description_en;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: itemTitle, zh: itemTitle }}
        lede={{
          en: itemBody || "Copies still in stock can be added to the cart.",
          zh: itemBody || "仍有庫存的數量可以加入購物車。",
        }}
      />
      <section className="site-wrap grid gap-8 py-14 md:grid-cols-[16rem_1fr]">
        <MarketplacePhoto src={listing.image_url} alt={itemTitle} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <div>
          <p className="text-2xl text-ink">{formatTwd(listing.price_twd)}</p>
          <p className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink">
            {tx(lang, stockLabel(listing.quantity))}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {tx(lang, conditionLabel(listing.condition))}
            {" · "}
            {tx(lang, categoryLabel(listing.category))}
            {listing.course_name ? ` · ${listing.course_name}` : ""}
          </p>
          <MarketplacePurchase
            lang={lang}
            listingId={listing.id}
            stock={listing.quantity}
            ownListing={access.status === "authenticated" && access.userId === listing.seller_id}
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <TextLink href={withLang(lang, "/marketplace")}>{tx(lang, { en: "Back to the marketplace", zh: "返回教材市集" })}</TextLink>
            <TextLink href={withLang(lang, "/marketplace/cart")}>{tx(lang, { en: "Cart", zh: "購物車" })}</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}
