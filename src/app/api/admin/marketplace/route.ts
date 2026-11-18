import { requireStaff } from "@/lib/auth-access";
import { getPlatformFee, listAdminTransactions, listModerationListings } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  try {
    const [listings, orders, platformFee] = await Promise.all([
      listModerationListings(),
      listAdminTransactions(),
      getPlatformFee(),
    ]);
    if (platformFee === null) return Response.json({ error: "settings_missing" }, { status: 500 });
    return Response.json({
      listings,
      orders,
      platform_fee_twd: platformFee,
      role: guard.role,
    });
  } catch {
    return Response.json({ error: "load_failed" }, { status: 500 });
  }
}
