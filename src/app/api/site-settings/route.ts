import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const { data, error } = await supabase
    .from("heca_site_settings")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(req: Request) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const adminClient = getSupabaseAdmin();
    const now = new Date().toISOString();

    let rowsToUpsert: { key: string; value: any; updated_at: string }[] = [];

    if (Array.isArray(body)) {
      rowsToUpsert = body.map((item: any) => ({
        key: item.key,
        value: item.value,
        updated_at: now,
      }));
    } else if (body.key && body.value !== undefined) {
      rowsToUpsert = [{ key: body.key, value: body.value, updated_at: now }];
    } else if (typeof body === "object" && body !== null) {
      rowsToUpsert = Object.entries(body).map(([k, v]) => ({
        key: k,
        value: v,
        updated_at: now,
      }));
    }

    if (rowsToUpsert.length === 0) {
      return NextResponse.json({ error: "Invalid payload: key and value are required" }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("heca_site_settings")
      .upsert(rowsToUpsert, { onConflict: "key" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: rowsToUpsert.length, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update site setting" }, { status: 500 });
  }
}
