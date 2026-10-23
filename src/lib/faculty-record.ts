export const facultyCategories = ["full-time", "visiting", "adjunct"] as const;

export type FacultyCategory = (typeof facultyCategories)[number];

export type FacultyRecord = {
  id: string;
  name: string;
  title: string | null;
  education: string | null;
  research_fields: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  category: FacultyCategory | null;
  sort_order: number;
};

export type FacultyWrite = Omit<FacultyRecord, "id">;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFacultyId(value: string) {
  return uuidPattern.test(value);
}

function optionalText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return undefined;
  return trimmed;
}

function publicUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return value;
  } catch {
    return undefined;
  }
  return undefined;
}

export function parseFacultyWrite(body: unknown): { ok: true; value: FacultyWrite } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const record = body as Record<string, unknown>;
  const name = optionalText(record.name);
  if (name === undefined) return { ok: false, error: "invalid_request" };
  if (!name) return { ok: false, error: "name_required" };

  const title = optionalText(record.title);
  const education = optionalText(record.education);
  const researchFields = optionalText(record.research_fields);
  const email = optionalText(record.email);
  const phone = optionalText(record.phone);
  const websiteText = optionalText(record.website);
  const imageText = optionalText(record.image_url);
  if (
    title === undefined ||
    education === undefined ||
    researchFields === undefined ||
    email === undefined ||
    phone === undefined ||
    websiteText === undefined ||
    imageText === undefined
  ) {
    return { ok: false, error: "invalid_request" };
  }
  const website = publicUrl(websiteText);
  const imageUrl = publicUrl(imageText);
  if (website === undefined || imageUrl === undefined) return { ok: false, error: "invalid_request" };

  let category: FacultyCategory | null = null;
  if (record.category !== null && record.category !== undefined && record.category !== "") {
    if (typeof record.category !== "string" || !facultyCategories.includes(record.category as FacultyCategory)) {
      return { ok: false, error: "invalid_category" };
    }
    category = record.category as FacultyCategory;
  }

  let sortOrder = 0;
  if (record.sort_order !== undefined && record.sort_order !== null && record.sort_order !== "") {
    const order = typeof record.sort_order === "number" ? record.sort_order : Number(record.sort_order);
    if (!Number.isInteger(order)) return { ok: false, error: "invalid_request" };
    sortOrder = order;
  }

  return {
    ok: true,
    value: {
      name,
      title,
      education,
      research_fields: researchFields,
      email,
      phone,
      website,
      image_url: imageUrl,
      category,
      sort_order: sortOrder,
    },
  };
}

export function parseFacultyOrder(body: unknown): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const ids = (body as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== "string" || !isFacultyId(id))) {
    return { ok: false, error: "invalid_request" };
  }
  if (new Set(ids).size !== ids.length) return { ok: false, error: "invalid_request" };
  return { ok: true, ids };
}

export function toFacultyRecord(row: {
  id?: unknown;
  name?: unknown;
  title?: unknown;
  education?: unknown;
  research_fields?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
  image_url?: unknown;
  category?: unknown;
  sort_order?: unknown;
}): FacultyRecord | null {
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  const category =
    typeof row.category === "string" && facultyCategories.includes(row.category as FacultyCategory)
      ? (row.category as FacultyCategory)
      : null;
  const sortOrder = typeof row.sort_order === "number" && Number.isInteger(row.sort_order) ? row.sort_order : 0;
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value : null);
  return {
    id: row.id,
    name: row.name,
    title: text(row.title),
    education: text(row.education),
    research_fields: text(row.research_fields),
    email: text(row.email),
    phone: text(row.phone),
    website: publicUrl(text(row.website)) ?? null,
    image_url: publicUrl(text(row.image_url)) ?? null,
    category,
    sort_order: sortOrder,
  };
}
