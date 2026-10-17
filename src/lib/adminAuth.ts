import { cookies } from "next/headers";
import { supabase, getSupabaseAdmin } from "./supabaseClient";

export async function verifyAdminSession(req?: Request): Promise<{ authenticated: boolean; email?: string; token?: string }> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/heca_admin_session=([^;]+)/);
        if (match) token = match[1].trim();
      }
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("heca_admin_session")?.value;
    } catch {
      // Invoked outside of Next.js server components / request store
    }
  }

  if (!token) {
    return { authenticated: false };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) {
      return { authenticated: false };
    }

    // Verify user is an authorized admin
    const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;
    const { data: adminRecord } = await adminClient
      .from("heca_admins")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!adminRecord) {
      return { authenticated: false };
    }

    return { authenticated: true, email: user.email, token };
  } catch {
    return { authenticated: false };
  }
}
