import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `login:${ip}`;

    const rl = await checkRateLimit(key);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Authenticate with Supabase Auth (exact password match only)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Verify admin access in heca_admins
    const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;
    const { data: adminRecord } = await adminClient
      .from("heca_admins")
      .select("email")
      .eq("email", authData.user.email)
      .single();

    if (!adminRecord) {
      return NextResponse.json({ error: "Access denied. Not an authorized admin." }, { status: 403 });
    }

    // Reset rate limit on success
    await resetRateLimit(key);

    // 3. Set HttpOnly cookie with session access_token
    const res = NextResponse.json({
      success: true,
      email: authData.user.email,
      token: authData.session.access_token,
    });

    res.cookies.set("heca_admin_session", authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
