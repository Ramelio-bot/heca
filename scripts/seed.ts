import { createClient } from "@supabase/supabase-js";
import { MOCK_PRODUCTS_50 } from "../src/data/mockProducts";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually if running directly with tsx
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      if (key && !process.env[key]) {
        process.env[key] = values.join("=");
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xrzdcqnezhcezitolkuu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PsuKyqXCDibmA-KQRri92Q_BF1DTNYW";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding 50 products to Supabase...");
  console.log(`Connecting to: ${supabaseUrl}`);

  // 1. Delete existing products to ensure clean seed
  console.log("Clearing existing products...");
  const { error: deleteError } = await supabase
    .from("heca_products")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.warn("Notice during delete:", deleteError.message);
  }

  // 2. Map 50 mock products to Supabase columns
  const rows = MOCK_PRODUCTS_50.map((p, index) => {
    const images = [p.image, p.hoverImage].filter(Boolean);
    return {
      name: p.name,
      price: p.price,
      display_price: p.displayPrice || `$${p.price}`,
      images: images,
      category: p.category,
      sub_category: p.subCategory,
      span: p.span || "col-span-12 md:col-span-4",
      height: p.height || "h-[60vh]",
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ["S", "M", "L"],
      is_new: !!p.isNew,
      discount_percent: p.discountPercent || 0,
      hover_image: p.hoverImage || null,
      description: p.description || null,
      material: p.material || null,
      care_instructions: p.careInstructions || null,
      shopee_url: p.shopeeUrl || null,
      tokopedia_url: p.tokopediaUrl || null,
      tiktok_url: p.tiktokUrl || null,
      sort_order: index + 1,
    };
  });

  // 3. Insert in batches of 10
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { error: insertError } = await supabase
      .from("heca_products")
      .insert(batch);

    if (insertError) {
      console.error(`Error inserting batch ${i / 10 + 1}:`, insertError);
      process.exit(1);
    }
  }

  // 4. Verify count
  const { count, error: countError } = await supabase
    .from("heca_products")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count check error:", countError);
  } else {
    console.log(`Successfully seeded! Total products in database: ${count}`);
  }
}

seed().catch(err => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
