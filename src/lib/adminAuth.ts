import { cookies } from "next/headers";
import { supabase } from "./supabaseClient";

export async function verifyAdminSession(req?: Request): Promise<{ authenticated: boolean; email?: string }> {
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
    const { data: adminRecord } = await supabase
      .from("heca_admins")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!adminRecord) {
      return { authenticated: false };
    }

    return { authenticated: true, email: user.email };
  } catch {
    return { authenticated: false };
  }
}
