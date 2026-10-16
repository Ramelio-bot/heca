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
      return NextResponse.json({ error: "Array of product ids in desired order is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    // Update sort_order for each id
    const updates = ids.map((id, index) =>
      adminClient
        .from("heca_products")
        .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to reorder products" }, { status: 500 });
  }
}
