import { createClient } from "@supabase/supabase-js";
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY tidak ada di .env.local. Seed dihentikan.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("HECA Seeder — Supabase Products Ingestion");
  console.log(`Connecting to: ${supabaseUrl}`);

  const isReset = process.argv.includes("--reset") || process.argv.includes("--fresh");

  if (isReset) {
    console.log("Flag --reset detected: clearing existing catalog...");
    const { error: deleteError } = await supabase
      .from("heca_products")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      console.warn("Notice during delete:", deleteError.message);
    } else {
      console.log("Catalog cleared successfully.");
    }
  }

  // Check for external JSON or CSV file parameter
  const fileArg = process.argv.find(arg => arg.endsWith(".json") || arg.endsWith(".csv"));
  let productsToInsert: any[] = [];

  if (fileArg && fs.existsSync(fileArg)) {
    console.log(`Loading external dataset from: ${fileArg}`);
    try {
      if (fileArg.endsWith(".json")) {
        const raw = fs.readFileSync(fileArg, "utf-8");
        productsToInsert = JSON.parse(raw);
      }
    } catch (parseErr: any) {
      console.error(`Failed to parse ${fileArg}:`, parseErr.message);
    }
  } else {
    console.log("No external dataset provided. To seed products from file, run:");
    console.log("  npx tsx scripts/seed.ts path/to/products.json [--reset]");
  }

  if (productsToInsert.length === 0) {
    console.log("No products to seed.");
    const { count } = await supabase
      .from("heca_products")
      .select("*", { count: "exact", head: true });
    console.log(`Current total products in database: ${count ?? 0}`);
    return;
  }

  // Fetch current products to perform safe upsert by name
  const { data: currentProducts, error: fetchError } = await supabase
    .from("heca_products")
    .select("id, name");

  if (fetchError) {
    console.error("Failed to query existing products:", fetchError);
    process.exit(1);
  }

  const existingMap = new Map<string, number>();
  currentProducts?.forEach(p => existingMap.set(p.name, p.id));

  let insertedCount = 0;
  let updatedCount = 0;

  for (const [index, p] of productsToInsert.entries()) {
    const images = Array.isArray(p.images) ? p.images : [p.image, p.hoverImage].filter(Boolean);
    const row = {
      name: p.name,
      price: Number(p.price),
      display_price: p.displayPrice || `$${p.price}`,
      images: images,
      category: p.category || "WOMAN",
      sub_category: p.subCategory || "DRESSES",
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
      etsy_url: p.etsyUrl || null,
      amazon_url: p.amazonUrl || null,
      alibaba_url: p.alibabaUrl || null,
      sort_order: p.sortOrder || index + 1,
    };

    const existingId = existingMap.get(row.name);
    if (existingId) {
      const { error: updErr } = await supabase
        .from("heca_products")
        .update(row)
        .eq("id", existingId);

      if (updErr) {
        console.error(`Error updating "${row.name}":`, updErr);
      } else {
        updatedCount++;
      }
    } else {
      const { error: insErr } = await supabase
        .from("heca_products")
        .insert([row]);

      if (insErr) {
        console.error(`Error inserting "${row.name}":`, insErr);
      } else {
        insertedCount++;
      }
    }
  }

  console.log(`Seeding summary: ${insertedCount} inserted, ${updatedCount} updated.`);

  const { count, error: countError } = await supabase
    .from("heca_products")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count check error:", countError);
  } else {
    console.log(`Total products in database: ${count}`);
  }
}

seed().catch(err => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
