import { NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyAdminSession } from "@/lib/adminAuth";

function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

import { DEFAULT_BABY_PRODUCTS } from "@/lib/babyProductsData";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("heca_products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }
  } catch {}

  const fallbackRows = DEFAULT_BABY_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    display_price: p.displayPrice,
    images: p.gallery || [p.image],
    hover_image: p.hoverImage,
    category: p.category,
    sub_category: p.subCategory,
    sizes: p.sizes,
    is_new: p.isNew,
    discount_percent: p.discountPercent,
    description: p.description,
    material: p.material,
    care_instructions: p.careInstructions,
    sort_order: p.sortOrder,
  }));

  return new NextResponse(JSON.stringify(fallbackRows), {
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

    // Input validation
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number greater than 0" }, { status: 400 });
    }

    const discountPercent = Number(body.discount_percent ?? 0);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({ error: "Discount percent must be between 0 and 100" }, { status: 400 });
    }

    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      return NextResponse.json({ error: "At least one size is required" }, { status: 400 });
    }

    const allowedSizes = ["NB", "50cm", "60cm", "70cm", "80cm", "90cm", "100cm", "110cm", "S", "M", "L", "XL", "ALL SIZE"];
    const invalidSizes = body.sizes.filter((s: string) => !allowedSizes.includes(s) && (!s || typeof s !== "string"));
    if (invalidSizes.length > 0) {
      return NextResponse.json({ error: "Sizes must be valid size options (e.g. NB, 50cm-110cm, S, M, L, XL)" }, { status: 400 });
    }

    const primaryImg = body.images?.[0] || body.image;
    if (!primaryImg || !isValidHttpUrl(primaryImg)) {
      return NextResponse.json({ error: "Valid image URL (http/https) is required" }, { status: 400 });
    }

    if (body.hover_image && !isValidHttpUrl(body.hover_image)) {
      return NextResponse.json({ error: "Hover image URL must be http/https" }, { status: 400 });
    }

    if (body.shopee_url && !isValidHttpUrl(body.shopee_url)) {
      return NextResponse.json({ error: "Shopee URL must start with http:// or https://" }, { status: 400 });
    }

    if (body.tokopedia_url && !isValidHttpUrl(body.tokopedia_url)) {
      return NextResponse.json({ error: "Tokopedia URL must start with http:// or https://" }, { status: 400 });
    }

    if (body.tiktok_url && !isValidHttpUrl(body.tiktok_url)) {
      return NextResponse.json({ error: "TikTok Shop URL must start with http:// or https://" }, { status: 400 });
    }

    if (body.etsy_url && !isValidHttpUrl(body.etsy_url)) {
      return NextResponse.json({ error: "Etsy URL must start with http:// or https://" }, { status: 400 });
    }

    if (body.amazon_url && !isValidHttpUrl(body.amazon_url)) {
      return NextResponse.json({ error: "Amazon URL must start with http:// or https://" }, { status: 400 });
    }

    if (body.alibaba_url && !isValidHttpUrl(body.alibaba_url)) {
      return NextResponse.json({ error: "Alibaba URL must start with http:// or https://" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient
      .from("heca_products")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
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
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    if (fields.price !== undefined) {
      const price = Number(fields.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ error: "Price must be a positive number greater than 0" }, { status: 400 });
      }
    }

    if (fields.discount_percent !== undefined) {
      const discount = Number(fields.discount_percent);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json({ error: "Discount percent must be between 0 and 100" }, { status: 400 });
      }
    }

    if (fields.images && fields.images.length > 0) {
      if (!isValidHttpUrl(fields.images[0])) {
        return NextResponse.json({ error: "Image URL must be http/https" }, { status: 400 });
      }
    }

    if (fields.hover_image && !isValidHttpUrl(fields.hover_image)) {
      return NextResponse.json({ error: "Hover image URL must be http/https" }, { status: 400 });
    }

    if (fields.shopee_url && !isValidHttpUrl(fields.shopee_url)) {
      return NextResponse.json({ error: "Shopee URL must start with http:// or https://" }, { status: 400 });
    }

    if (fields.tokopedia_url && !isValidHttpUrl(fields.tokopedia_url)) {
      return NextResponse.json({ error: "Tokopedia URL must start with http:// or https://" }, { status: 400 });
    }

    if (fields.tiktok_url && !isValidHttpUrl(fields.tiktok_url)) {
      return NextResponse.json({ error: "TikTok Shop URL must start with http:// or https://" }, { status: 400 });
    }

    if (fields.etsy_url && !isValidHttpUrl(fields.etsy_url)) {
      return NextResponse.json({ error: "Etsy URL must start with http:// or https://" }, { status: 400 });
    }

    if (fields.amazon_url && !isValidHttpUrl(fields.amazon_url)) {
      return NextResponse.json({ error: "Amazon URL must start with http:// or https://" }, { status: 400 });
    }

    if (fields.alibaba_url && !isValidHttpUrl(fields.alibaba_url)) {
      return NextResponse.json({ error: "Alibaba URL must start with http:// or https://" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient
      .from("heca_products")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
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
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const adminClient = getSupabaseAdmin();
    const { error } = await adminClient
      .from("heca_products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}
