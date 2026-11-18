import { getAccess } from "@/lib/auth-access";
import { getMarketplaceProfile, placeMarketplaceOrders } from "@/lib/marketplace-server";
import { parseCheckout } from "@/lib/marketplace-record";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getAccess();
  if (access.status !== "authenticated") return Response.json({ signed_in: false, needs_profile: true });
  try {
    const profile = await getMarketplaceProfile(access.userId);
    return Response.json({ signed_in: true, needs_profile: !profile, user_id: access.userId });
  } catch {
    return Response.json({ error: "load_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await getAccess();
  if (access.status !== "authenticated") return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseCheckout(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await placeMarketplaceOrders(access.userId, parsed.profile, parsed.groups);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json(saved.value);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
