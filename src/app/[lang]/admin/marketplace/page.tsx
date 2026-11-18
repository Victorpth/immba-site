import { AdminMarketplace } from "@/components/admin-marketplace";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Marketplace admin", zh: "市集管理" };
const description = {
  en: "Remove listings and review marketplace orders. Orders cannot be edited here.",
  zh: "下架刊登並查看市集訂單。這裡不能修改訂單。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdminMarketplacePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();

  return (
    <>
      <PageIntro
        lang={raw}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Moderate listings and review orders.", zh: "審核刊登並查看訂單。" }}
        lede={{
          en: "Admins can take a listing off sale. Every order stays read-only. Only a super admin changes the platform fee, and older orders keep the fee they were created with.",
          zh: "管理員可以將刊登下架。所有訂單只能查看。只有超級管理員可以修改平台手續費，已成立的訂單仍使用當初的手續費。",
        }}
      />
      <AdminMarketplace lang={raw} />
    </>
  );
}
