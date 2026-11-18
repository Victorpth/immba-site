import { requireStaff } from "@/lib/auth-access";
import { parsePlatformFee } from "@/lib/marketplace-record";
import { setPlatformFee } from "@/lib/marketplace-server";

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

  const parsed = parsePlatformFee(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await setPlatformFee(guard.userId, parsed.fee);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json({ platform_fee_twd: saved.value });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
