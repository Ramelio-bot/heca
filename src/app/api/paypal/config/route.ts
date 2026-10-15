import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const mode = process.env.PAYPAL_MODE || "sandbox";
  return NextResponse.json({
    clientId,
    currency: "USD",
    mode,
  });
}
