import { NextResponse } from "next/server";
import { verifyCustomerSession } from "@/lib/customerAuth";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const session = await verifyCustomerSession(req);

  if (!session.authenticated || !session.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const adminClient = getSupabaseAdmin();

  // Fetch orders for this customer (by auth_user_id or matching customer_email)
  const { data: orders } = await adminClient
    .from("heca_orders")
    .select("id, paypal_order_id, product_name, size, qty, total, currency, status, created_at, shipping_address")
    .or(`auth_user_id.eq.${session.user.id},customer_email.eq.${session.user.email}`)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    customer: session.customer,
    orders: orders || [],
  });
}

export async function PUT(req: Request) {
  const session = await verifyCustomerSession(req);

  if (!session.authenticated || !session.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = body;

    const adminClient = getSupabaseAdmin();

    const updatePayload: Record<string, any> = {
      auth_user_id: session.user.id,
      updated_at: new Date().toISOString(),
    };

    if (fullName !== undefined) updatePayload.full_name = fullName ? String(fullName).trim() : null;
    if (phone !== undefined) updatePayload.phone = phone ? String(phone).trim() : null;
    if (addressLine1 !== undefined) updatePayload.address_line1 = addressLine1 ? String(addressLine1).trim() : null;
    if (addressLine2 !== undefined) updatePayload.address_line2 = addressLine2 ? String(addressLine2).trim() : null;
    if (city !== undefined) updatePayload.city = city ? String(city).trim() : null;
    if (state !== undefined) updatePayload.state = state ? String(state).trim() : null;
    if (postalCode !== undefined) updatePayload.postal_code = postalCode ? String(postalCode).trim() : null;
    if (country !== undefined) updatePayload.country = country ? String(country).trim() : "Indonesia";

    const { data: updatedCustomer, error } = await adminClient
      .from("heca_customers")
      .upsert(updatePayload, { onConflict: "auth_user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile." }, { status: 500 });
  }
}
