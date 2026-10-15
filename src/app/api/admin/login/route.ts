import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Verify admin access in heca_admins
    const { data: adminRecord } = await supabase
      .from("heca_admins")
      .select("email")
      .eq("email", data.user.email)
      .single();

    if (!adminRecord) {
      return NextResponse.json({ error: "Access denied. Not an authorized admin." }, { status: 403 });
    }

    // 3. Set HttpOnly cookie with session access_token
    const res = NextResponse.json({
      success: true,
      email: data.user.email,
    });

    res.cookies.set("heca_admin_session", data.session.access_token, {
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
