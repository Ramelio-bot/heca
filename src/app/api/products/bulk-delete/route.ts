import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Array of product ids is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { error } = await adminClient
      .from("heca_products")
      .delete()
      .in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to bulk delete products" }, { status: 500 });
  }
}
