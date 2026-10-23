import "server-only";

import { createClient } from "@supabase/supabase-js";
import { fetch as undiciFetch } from "undici";

export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Next's patched fetch stalls PATCH and DELETE from this server.
      fetch: ((input: RequestInfo | URL, init?: RequestInit) =>
        undiciFetch(input as never, init as never)) as unknown as typeof fetch,
    },
  });
}
