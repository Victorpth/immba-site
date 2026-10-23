import "server-only";

import { toFacultyRecord, type FacultyRecord } from "@/lib/faculty-record";
import { createSupabaseServer } from "@/lib/supabase-server";

const columns = "id, name, title, education, research_fields, email, phone, website, image_url, category, sort_order";

export async function listFaculty(): Promise<FacultyRecord[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("faculty").select(columns).order("sort_order", { ascending: true });
  if (error) throw new Error("Could not load faculty.");
  return (data ?? []).flatMap((row) => {
    const record = toFacultyRecord(row);
    return record ? [record] : [];
  });
}
