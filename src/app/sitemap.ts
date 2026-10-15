import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://heca-official.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const { data: products } = await supabase
      .from("heca_products")
      .select("id, updated_at")
      .order("id");

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${baseUrl}/#product-${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (err) {
    console.error("Error generating sitemap:", err);
    return staticRoutes;
  }
}
