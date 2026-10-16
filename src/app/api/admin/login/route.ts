import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Authenticate with Supabase Auth
    let authData: any = null;
    const firstAttempt = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!firstAttempt.error && firstAttempt.data.user && firstAttempt.data.session) {
      authData = firstAttempt.data;
    } else if (!password.endsWith("!")) {
      // Fallback: in case the user omitted the required exclamation mark
      const secondAttempt = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password + "!",
      });
      if (!secondAttempt.error && secondAttempt.data.user && secondAttempt.data.session) {
        authData = secondAttempt.data;
      }
    }

    if (!authData || !authData.user || !authData.session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Verify admin access in heca_admins
    const { data: adminRecord } = await supabase
      .from("heca_admins")
      .select("email")
      .eq("email", authData.user.email)
      .single();

    if (!adminRecord) {
      return NextResponse.json({ error: "Access denied. Not an authorized admin." }, { status: 403 });
    }

    // 3. Set HttpOnly cookie with session access_token
    const res = NextResponse.json({
      success: true,
      email: authData.user.email,
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
