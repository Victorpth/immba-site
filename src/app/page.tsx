import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const headerList = await headers();
  const accept = headerList.get("accept-language") ?? "";
  const lang = /zh/i.test(accept) ? "zh" : "en";
  redirect(`/${lang}`);
}
