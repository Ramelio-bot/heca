import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "PayPal credentials are not configured on server (503 Service Unavailable)." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { productId, size, qty = 1, customerEmail, customerName, shippingAddress } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // 1. Fetch genuine product from database
    const { data: product, error: productError } = await supabase
      .from("heca_products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Fetch shipping cost from settings
    let shipping = 15;
    try {
      const { data: setting } = await supabase
        .from("heca_settings")
        .select("value")
        .eq("key", "shipping_usd")
        .single();
      if (setting && setting.value !== undefined) {
        shipping = Number(setting.value);
      }
    } catch {}

    // 3. Compute price on server side
    const rawPrice = Number(product.price);
    const discount = Number(product.discount_percent || 0);
    const unitPrice = discount > 0 ? rawPrice * (1 - discount / 100) : rawPrice;
    const quantity = Math.max(1, Number(qty) || 1);
    const subtotal = unitPrice * quantity;
    const total = subtotal + shipping;

    const adminClient = getSupabaseAdmin();

    // 4. Create local order record in heca_orders (server-only table)
    const { data: localOrder, error: orderError } = await adminClient
      .from("heca_orders")
      .insert([
        {
          product_id: product.id,
          product_name: product.name,
          size: size || "M",
          unit_price: unitPrice,
          currency: "USD",
          qty: quantity,
          subtotal: subtotal,
          shipping: shipping,
          total: total,
          status: "CREATED",
          customer_email: customerEmail || null,
          customer_name: customerName || null,
          shipping_address: shippingAddress || null,
        },
      ])
      .select()
      .single();

    if (orderError || !localOrder) {
      console.error("Failed to create local order:", orderError);
      return NextResponse.json({ error: "Failed to create order record" }, { status: 500 });
    }

    // 5. Call PayPal v2 create order
    const paypalOrder = await createPayPalOrder({
      amount: total,
      currency: "USD",
      description: `HECA — ${product.name} (${size || "M"})`,
      customId: localOrder.id,
    });

    // 6. Update local order with paypal_order_id
    await adminClient
      .from("heca_orders")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", localOrder.id);

    return NextResponse.json({
      orderId: localOrder.id,
      paypalOrderId: paypalOrder.id,
    });
  } catch (err: any) {
    console.error("PayPal create order API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
