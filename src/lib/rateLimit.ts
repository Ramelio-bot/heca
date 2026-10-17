import { getSupabaseAdmin, supabase } from "./supabaseClient";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;
    const { data, error } = await client.rpc("register_login_attempt", { p_key: key });
    if (error || !data) {
      // Gagal membaca rate limit -> jangan kunci user (fail-open agar tidak mengunci admin sendiri)
      console.error("Rate limit check failed:", error);
      return { allowed: true, retryAfter: 0 };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      allowed: Boolean(row?.allowed),
      retryAfter: Number(row?.retry_after ?? 0),
    };
  } catch (err) {
    console.error("Rate limit exception:", err);
    return { allowed: true, retryAfter: 0 };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;
    await client.rpc("clear_login_attempt", { p_key: key });
  } catch (err) {
    console.error("Rate limit reset failed:", err);
  }
}

export const RATE_LIMIT_MAX = MAX_ATTEMPTS;
export const RATE_LIMIT_WINDOW_MIN = WINDOW_MINUTES;
