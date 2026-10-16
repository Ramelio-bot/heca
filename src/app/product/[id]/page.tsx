import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProductDetailClient from "./ProductDetailClient";
import { Product } from "@/context/ProductContext";

export const revalidate = 60;

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("heca_products")
    .select("id");

  return (products || []).map((p) => ({
    id: p.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: row } = await supabase
    .from("heca_products")
    .select("*")
    .eq("id", id)
    .single();

  if (!row) {
    return {
      title: "Archive Item Not Found | HECA",
      description: "The requested archive piece could not be located.",
    };
  }

  const title = `${row.name} — HECA Archive`;
  const description =
    row.description || `Explore ${row.name} from the HECA contemporary fashion collection.`;
  const image = row.images?.[0] || "";

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

  const { data: row, error } = await supabase
    .from("heca_products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) {
    notFound();
  }

  const product: Product = {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    displayPrice: row.display_price || `$${row.price}`,
    image: row.images?.[0] || "",
    hoverImage: row.hover_image || undefined,
    gallery: row.images || [],
    category: row.category,
    subCategory: row.sub_category || "",
    sizes: row.sizes?.length ? row.sizes : ["S", "M", "L"],
    isNew: !!row.is_new,
    discountPercent: Number(row.discount_percent ?? 0),
    span: row.span || "col-span-12 md:col-span-4",
    height: row.height || "h-[60vh]",
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
  };

  const finalPrice = product.discountPercent
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
    description: product.description || `HECA luxury archive — ${product.name}`,
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
    <main className="min-h-screen bg-heca-bg text-heca-primary font-sans antialiased">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Editorial Nav */}
      <header className="sticky top-0 z-30 bg-heca-bg/90 backdrop-blur-md border-b border-heca-primary/10 px-6 md:px-12 py-5 flex justify-between items-center">
        <Link href="/" className="font-serif text-3xl font-black uppercase tracking-tighter hover:opacity-70 transition-opacity">
          HECA
        </Link>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-medium">
          <Link href="/#catalog" className="hover:opacity-60 transition-opacity">
            ← Return to Archive
          </Link>
        </div>
      </header>

      {/* Product Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <ProductDetailClient product={product} />
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-heca-primary/10 py-12 px-6 md:px-12 text-center text-[10px] uppercase tracking-widest opacity-40">
        &copy; {new Date().getFullYear()} HECA. All Rights Reserved.
      </footer>
    </main>
  );
}
