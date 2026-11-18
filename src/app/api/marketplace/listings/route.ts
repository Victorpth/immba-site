import { isListingId } from "@/lib/marketplace-record";
import { getListingsByIds } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(isListingId) ?? [];
  if (!ids.length) return Response.json([]);
  try {
    return Response.json(await getListingsByIds(ids));
  } catch {
    return Response.json({ error: "load_failed" }, { status: 500 });
  }
}
