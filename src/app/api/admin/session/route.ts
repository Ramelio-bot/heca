import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    email: auth.email,
  });
}
