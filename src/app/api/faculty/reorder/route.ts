import { parseFacultyOrder } from "@/lib/faculty-record";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  // TODO: verify admin authentication before reordering faculty records.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseFacultyOrder(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const supabase = createSupabaseServer();
    for (let index = 0; index < parsed.ids.length; index += 1) {
      const { error } = await supabase.from("faculty").update({ sort_order: index + 1 }).eq("id", parsed.ids[index]);
      if (error) return Response.json({ error: "save_failed" }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
