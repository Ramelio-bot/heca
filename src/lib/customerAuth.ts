import { cookies } from "next/headers";
import { supabase, getSupabaseAdmin } from "./supabaseClient";

export interface CustomerProfile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSessionResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
  };
  customer?: CustomerProfile | null;
  token?: string;
}

export async function verifyCustomerSession(req?: Request): Promise<CustomerSessionResult> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/heca_customer_session=([^;]+)/);
        if (match) token = match[1].trim();
      }
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("heca_customer_session")?.value;
    } catch {
      // Outside of request context
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

    const adminClient = getSupabaseAdmin();
    const { data: customer } = await adminClient
      .from("heca_customers")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      customer: customer || null,
      token,
    };
  } catch {
    return { authenticated: false };
  }
}
