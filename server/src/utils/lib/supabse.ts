import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

// Service role client (server-only). Do NOT expose this in frontend.
export const sbAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "snapwise-server/1.0" } }
});
