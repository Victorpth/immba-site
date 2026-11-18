import { getAccess } from "@/lib/auth-access";
import { parseStatusChange } from "@/lib/marketplace-record";
import { advanceMarketplaceOrder, listMyOrders } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getAccess();
  if (access.status !== "authenticated") return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const orders = await listMyOrders(access.userId);
    return Response.json({ buyer_orders: orders.buyerOrders, seller_orders: orders.sellerOrders });
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

  const parsed = parseStatusChange(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await advanceMarketplaceOrder(access.userId, parsed.orderId, parsed.status);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json(saved.value);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
