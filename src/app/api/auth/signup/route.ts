import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `signup:${ip}`;

    const rl = await checkRateLimit(rateLimitKey);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please retry in ${rl.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, fullName, phone } = body;

    // 1. Input validations
    if (!email || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Full name must be at least 2 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone ? String(phone).trim() : null;

    // 2. Create user with adminClient to ensure email_confirm is true and identities are set
    const adminClient = getSupabaseAdmin();
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        phone: cleanPhone,
      },
    });

    if (createError || !createData.user) {
      const msg = createError?.message || "Failed to create customer account.";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("exists")) {
        return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const user = createData.user;

    // 3. Upsert into public.heca_customers
    const { error: customerError } = await adminClient
      .from("heca_customers")
      .upsert(
        {
          auth_user_id: user.id,
          full_name: cleanName,
          phone: cleanPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "auth_user_id" }
      );

    if (customerError) {
      console.error("Failed to insert customer record:", customerError);
    }

    // 4. Sign in immediately to generate access token session
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    await resetRateLimit(rateLimitKey);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: cleanName,
        phone: cleanPhone,
      },
    });

    if (!signInError && authData.session?.access_token) {
      res.cookies.set("heca_customer_session", authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return res;
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error during registration." }, { status: 500 });
  }
}
