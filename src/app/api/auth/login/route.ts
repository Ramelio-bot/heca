import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `customer-login:${ip}`;

    const rl = await checkRateLimit(rateLimitKey);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rl.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await resetRateLimit(rateLimitKey);

    // 2. Fetch customer profile from heca_customers
    const adminClient = getSupabaseAdmin();
    const { data: customer } = await adminClient
      .from("heca_customers")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    // 3. Set HttpOnly customer session cookie
    const res = NextResponse.json({
      success: true,
      email: authData.user.email,
      name: customer?.full_name || authData.user.user_metadata?.full_name || "",
      phone: customer?.phone || authData.user.user_metadata?.phone || "",
    });

    res.cookies.set("heca_customer_session", authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("Customer login error:", err);
    return NextResponse.json({ error: err.message || "Failed to log in." }, { status: 500 });
  }
}
