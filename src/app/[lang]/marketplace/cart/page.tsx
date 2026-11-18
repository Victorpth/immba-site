import { MarketplaceCart } from "@/components/marketplace-cart";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Cart", zh: "購物車" };
const description = {
  en: "Review books in the cart, choose delivery, and place one order per seller.",
  zh: "確認購物車中的書籍、選擇運送方式，並為每位賣家各成立一筆訂單。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();

  return (
    <>
      <PageIntro
        lang={raw}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Cart.", zh: "購物車。" }}
        lede={{
          en: "Pickup is free. Home delivery is NT$80. Each seller is a separate order.",
          zh: "面交免費。宅配 80 元。每位賣家各自成立一筆訂單。",
        }}
      />
      <MarketplaceCart lang={raw} />
    </>
  );
}
