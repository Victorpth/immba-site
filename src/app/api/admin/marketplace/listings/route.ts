import { requireStaff } from "@/lib/auth-access";
import { parseListingModeration } from "@/lib/marketplace-record";
import { setListingSaleStatus } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseListingModeration(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await setListingSaleStatus(parsed.listingId, parsed.status);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json(saved.value);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
