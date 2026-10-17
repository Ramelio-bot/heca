import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const { data, error } = await supabase
    .from("heca_hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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

    // Check if reordering slides
    if (body.action === "reorder" && Array.isArray(body.ids)) {
      const adminClient = getSupabaseAdmin();
      const updates = body.ids.map((id: number, index: number) =>
        adminClient
          .from("heca_hero_slides")
          .update({ sort_order: index + 1 })
          .eq("id", id)
      );
      await Promise.all(updates);
      return NextResponse.json({ success: true });
    }

    if (!body.url) {
      return NextResponse.json({ error: "Slide URL is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient
      .from("heca_hero_slides")
      .insert([{
        type: body.type || "image",
        url: body.url,
        sort_order: body.sort_order ?? 999,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create slide" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient
      .from("heca_hero_slides")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update slide" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { error } = await adminClient
      .from("heca_hero_slides")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete slide" }, { status: 500 });
  }
}
