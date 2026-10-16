import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "PayPal credentials are not configured on server (503 Service Unavailable)." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();

    // 1. Find order by local ID or paypal_order_id
    let { data: order } = await adminClient
      .from("heca_orders")
      .select("*")
      .eq("paypal_order_id", orderId)
      .single();

    if (!order) {
      const { data: byLocalId } = await adminClient
        .from("heca_orders")
        .select("*")
        .eq("id", orderId)
        .single();
      order = byLocalId;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paypalOrderId = order.paypal_order_id || orderId;

    // 2. Capture payment with PayPal
    const captureData = await capturePayPalOrder(paypalOrderId);

    if (captureData.status !== "COMPLETED") {
      await adminClient
        .from("heca_orders")
        .update({ status: captureData.status || "FAILED", updated_at: new Date().toISOString() })
        .eq("id", order.id);

      return NextResponse.json({ error: `PayPal capture not completed: ${captureData.status}` }, { status: 400 });
    }

    // 3. Extract customer info from PayPal response
    const payer = captureData.payer;
    const payerEmail = payer?.email_address || order.customer_email;
    const payerName = payer?.name ? `${payer.name.given_name || ""} ${payer.name.surname || ""}`.trim() : order.customer_name;
    const shipping = captureData.purchase_units?.[0]?.shipping;

    // 4. Update order status to CAPTURED
    await adminClient
      .from("heca_orders")
      .update({
        status: "CAPTURED",
        customer_email: payerEmail,
        customer_name: payerName,
        shipping_address: shipping ? shipping.address : order.shipping_address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      status: "COMPLETED",
      orderId: order.id,
      paypalOrderId: paypalOrderId,
      total: order.total,
    });
  } catch (err: any) {
    console.error("PayPal capture API error:", err);
    return NextResponse.json({ error: err.message || "Capture error" }, { status: 500 });
  }
}
