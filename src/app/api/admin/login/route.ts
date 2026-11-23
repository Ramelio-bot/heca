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

    // 1. Authenticate with Supabase Auth (with offline fallback for admin@heca.com)
    let sessionToken = "";
    let userEmail = email.trim();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user || !authData.session) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;
      const { data: adminRecord } = await adminClient
        .from("heca_admins")
        .select("email")
        .eq("email", authData.user.email)
        .single();

      if (!adminRecord) {
        return NextResponse.json({ error: "Access denied. Not an authorized admin." }, { status: 403 });
      }

      sessionToken = authData.session.access_token;
      userEmail = authData.user.email || email.trim();
    } catch {
      // Fallback when Supabase project is paused/offline
      if (email.trim().toLowerCase() === "admin@heca.com" && password === "Heca2026!") {
        sessionToken = "heca_fallback_admin_token_2026";
        userEmail = "admin@heca.com";
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    // Reset rate limit on success
    await resetRateLimit(key);

    // 3. Set HttpOnly cookie with session access_token
    const res = NextResponse.json({
      success: true,
      email: userEmail,
      token: sessionToken,
    });

    res.cookies.set("heca_admin_session", sessionToken, {
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
