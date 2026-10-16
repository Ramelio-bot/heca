import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log("Received PayPal Webhook event:", eventType);

    if (eventType === "PAYMENT.CAPTURE.COMPLETED" && resource) {
      const orderId = resource.custom_id;
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
      const payerEmail = resource.payer?.email_address;

      const adminClient = getSupabaseAdmin();

      if (orderId) {
        await adminClient
          .from("heca_orders")
          .update({
            status: "CAPTURED",
            customer_email: payerEmail || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      } else if (paypalOrderId) {
        await adminClient
          .from("heca_orders")
          .update({
            status: "CAPTURED",
            customer_email: payerEmail || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_order_id", paypalOrderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("PayPal webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}
