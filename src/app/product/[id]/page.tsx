import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProductDetailClient from "./ProductDetailClient";
import { Product } from "@/context/ProductContext";
import { DEFAULT_BABY_PRODUCTS } from "@/lib/babyProductsData";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from("heca_products")
      .select("id");

    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p.id.toString(),
      }));
    }
  } catch {}
  return DEFAULT_BABY_PRODUCTS.map((p) => ({
    id: p.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let row: any = null;
  try {
    const { data } = await supabase
      .from("heca_products")
      .select("*")
      .eq("id", id)
      .single();
    row = data;
  } catch {}

  const fallback = DEFAULT_BABY_PRODUCTS.find((p) => p.id.toString() === id);

  if (!row && !fallback) {
    return {
      title: "Produk Tidak Ditemukan | Baby Gemoy HECA",
      description: "Produk pakaian bayi yang Anda cari tidak ditemukan.",
    };
  }

  const name = row?.name || fallback?.name || "Baby Gemoy HECA";
  const title = `${name} — Baby Gemoy HECA`;
  const description =
    row?.description || fallback?.description || `Koleksi ${name} dari Baby Gemoy HECA.`;
  const image = row?.images?.[0] || fallback?.image || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let row: any = null;
  try {
    const { data } = await supabase
      .from("heca_products")
      .select("*")
      .eq("id", id)
      .single();
    row = data;
  } catch {}

  const fallback = DEFAULT_BABY_PRODUCTS.find((p) => p.id.toString() === id);

  if (!row && !fallback) {
    notFound();
  }

  const product: Product = row
    ? {
        id: row.id,
        name: row.name,
        price: Number(row.price),
        displayPrice: row.display_price || `$${row.price}`,
        image: row.images?.[0] || "",
        hoverImage: row.hover_image || undefined,
        gallery: row.images || [],
        category: row.category,
        subCategory: row.sub_category || "",
        sizes: row.sizes?.length ? row.sizes : ["60cm", "70cm", "80cm"],
        isNew: !!row.is_new,
        discountPercent: Number(row.discount_percent ?? 0),
        description: row.description || undefined,
        material: row.material || undefined,
        careInstructions: row.care_instructions || undefined,
        shopeeUrl: row.shopee_url || undefined,
        tokopediaUrl: row.tokopedia_url || undefined,
        tiktokUrl: row.tiktok_url || undefined,
        etsyUrl: row.etsy_url || undefined,
        amazonUrl: row.amazon_url || undefined,
        alibabaUrl: row.alibaba_url || undefined,
        videoUrl: row.video_url || undefined,
        sizeGuideUrl: row.size_guide_url || undefined,
        sortOrder: row.sort_order ?? 0,
      }
    : fallback!;

  const finalPrice = product.discountPercent
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
    description: product.description || `Baby Gemoy HECA — ${product.name}`,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: finalPrice.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://heca-official.vercel.app/product/${product.id}`,
    },
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2523] font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#2C2523]/10 px-4 sm:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="font-serif text-2xl font-bold text-[#2C2523]">Baby Gemoy</span>
          <span className="bg-[#E05A47] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
            HECA
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/#catalog" className="px-4 py-2 rounded-full bg-white border border-[#2C2523]/15 hover:border-[#2C2523] transition-colors">
            ← Kembali ke Katalog Bayi
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-16">
        <ProductDetailClient product={product} />
      </section>
    </main>
  );
}
