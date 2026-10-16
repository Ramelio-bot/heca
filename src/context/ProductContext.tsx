"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ProductSize = "S" | "M" | "L" | "XL";

export interface Product {
  id: number;
  name: string;
  price: number;
  displayPrice: string;
  image: string;
  category: string;
  subCategory: string;
  sizes: ProductSize[];
  isNew?: boolean;
  discountPercent?: number;
  span?: string;
  height?: string;
  shopeeUrl?: string;
  tokopediaUrl?: string;
  tiktokUrl?: string;
  etsyUrl?: string;
  amazonUrl?: string;
  alibabaUrl?: string;
  hoverImage?: string;
  description?: string;
  material?: string;
  careInstructions?: string;
  gallery?: string[];
  videoUrl?: string;
  sizeGuideUrl?: string;
  sortOrder?: number;
}

export interface StoreLinks {
  shopee: string;
  tokopedia: string;
  tiktok: string;
  etsy: string;
  amazon: string;
  alibaba: string;
  instagram: string;
  pinterest: string;
  spotify: string;
  clientService: string;
}

export interface HeroSlide {
  id: number;
  type: "image" | "video";
  url: string;
}

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  heroSlides: HeroSlide[];
  activeCategory: string;
  activeSubCategory: string | null;
  searchQuery: string;
  storeLinks: StoreLinks;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  bulkDeleteProducts: (ids: number[]) => Promise<void>;
  reorderProduct: (draggedId: number, targetId: number) => void | Promise<void>;
  addHeroSlide: (slide: Omit<HeroSlide, "id">) => void | Promise<void>;
  updateHeroSlide: (id: number, slide: Partial<HeroSlide>) => void | Promise<void>;
  deleteHeroSlide: (id: number) => void | Promise<void>;
  reorderHeroSlide: (draggedId: number, targetId: number) => void | Promise<void>;
  updateStoreLinks: (links: StoreLinks) => void | Promise<void>;
  setFilter: (category: string, subCategory: string | null) => void;
  setSearchQuery: (query: string) => void;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { id: 1, type: "image", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" },
  { id: 2, type: "image", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop" },
  { id: 3, type: "image", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop" },
];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to map Supabase row to Product interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRowToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  displayPrice: row.display_price,
  image: row.images?.[0] || "",
  hoverImage: row.hover_image || undefined,
  gallery: row.images,
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
});

// Helper to map Product interface to Supabase row
const mapProductToRow = (p: Partial<Product>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.price !== undefined) row.price = p.price;
  if (p.displayPrice !== undefined) row.display_price = p.displayPrice;
  if (p.category !== undefined) row.category = p.category;
  if (p.subCategory !== undefined) row.sub_category = p.subCategory;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.isNew !== undefined) row.is_new = p.isNew;
  if (p.discountPercent !== undefined) row.discount_percent = p.discountPercent;
  if (p.hoverImage !== undefined) row.hover_image = p.hoverImage;
  if (p.description !== undefined) row.description = p.description;
  if (p.material !== undefined) row.material = p.material;
  if (p.careInstructions !== undefined) row.care_instructions = p.careInstructions;
  if (p.shopeeUrl !== undefined) row.shopee_url = p.shopeeUrl;
  if (p.tokopediaUrl !== undefined) row.tokopedia_url = p.tokopediaUrl;
  if (p.tiktokUrl !== undefined) row.tiktok_url = p.tiktokUrl;
  if (p.etsyUrl !== undefined) row.etsy_url = p.etsyUrl;
  if (p.amazonUrl !== undefined) row.amazon_url = p.amazonUrl;
  if (p.alibabaUrl !== undefined) row.alibaba_url = p.alibabaUrl;
  if (p.videoUrl !== undefined) row.video_url = p.videoUrl;
  if (p.sizeGuideUrl !== undefined) row.size_guide_url = p.sizeGuideUrl;
  if (p.sortOrder !== undefined) row.sort_order = p.sortOrder;
  if (p.gallery) row.images = p.gallery;
  else if (p.image) row.images = [p.image];
  if (p.span !== undefined) row.span = p.span;
  if (p.height !== undefined) row.height = p.height;
  return row;
};

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("WOMAN");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [storeLinks, setStoreLinks] = useState<StoreLinks>({
    shopee: "https://shopee.co.id/heca.official",
    tokopedia: "https://tokopedia.com/hecaofficial",
    tiktok: "https://tiktok.com/@heca.official",
    etsy: "https://www.etsy.com/shop/hecaofficial",
    amazon: "https://www.amazon.com/stores/hecaofficial",
    alibaba: "https://hecaofficial.en.alibaba.com",
    instagram: "https://instagram.com/heca.official",
    pinterest: "https://pinterest.com/heca.official",
    spotify: "https://spotify.com/user/heca.official",
    clientService: "mailto:care@heca.com",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('heca_products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data) {
        setProducts(data.map(mapRowToProduct));
      }
    } catch (err) {
      console.error("Error fetching products from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('heca_hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setHeroSlides(data);
      } else {
        setHeroSlides(DEFAULT_HERO_SLIDES);
      }
    } catch (err) {
      console.error("Error fetching hero slides from Supabase:", err);
      setHeroSlides(DEFAULT_HERO_SLIDES);
    }
  };

  const fetchStoreLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('heca_settings')
        .select('*')
        .eq('key', 'store_links')
        .single();
      if (error) throw error;
      if (data && data.value) {
        setStoreLinks(data.value as StoreLinks);
      }
    } catch (err) {
      console.error("Error fetching store links from Supabase:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchHeroSlides();
    fetchStoreLinks();
  }, []);

  const addProduct = async (newProduct: Omit<Product, "id">) => {
    const row = mapProductToRow(newProduct);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to add product");
    }
    const data = await res.json();
    if (data) {
      setProducts(prev => [mapRowToProduct(data), ...prev]);
    }
  };

  const updateProduct = async (id: number, updatedFields: Partial<Product>) => {
    const row = mapProductToRow(updatedFields);
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...row }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update product");
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete product");
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const bulkDeleteProducts = async (ids: number[]) => {
    const res = await fetch("/api/products/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete products");
    }
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const reorderProduct = async (draggedId: number, targetId: number) => {
    const draggedIdx = products.findIndex(p => p.id === draggedId);
    const targetIdx = products.findIndex(p => p.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0 || draggedIdx === targetIdx) return;
    const newProducts = [...products];
    const [draggedItem] = newProducts.splice(draggedIdx, 1);
    newProducts.splice(targetIdx, 0, draggedItem);
    setProducts(newProducts);

    try {
      const res = await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newProducts.map(p => p.id) }),
      });
      if (!res.ok) {
        console.error("Failed to persist product sort order on server");
      }
    } catch (err) {
      console.error("Error updating sort_order on server:", err);
    }
  };

  const addHeroSlide = async (newSlide: Omit<HeroSlide, "id">) => {
    const nextSortOrder = heroSlides.length + 1;
    const res = await fetch("/api/slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newSlide.type,
        url: newSlide.url,
        sort_order: nextSortOrder,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to add hero slide");
    }
    const data = await res.json();
    if (data) {
      setHeroSlides(prev => [...prev, data]);
    }
  };

  const deleteHeroSlide = async (id: number) => {
    const res = await fetch(`/api/slides?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete hero slide");
    }
    setHeroSlides(prev => prev.filter(s => s.id !== id));
  };

  const updateHeroSlide = async (id: number, updatedFields: Partial<HeroSlide>) => {
    const res = await fetch("/api/slides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update hero slide");
    }
    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const reorderHeroSlide = async (draggedId: number, targetId: number) => {
    const draggedIdx = heroSlides.findIndex(s => s.id === draggedId);
    const targetIdx = heroSlides.findIndex(s => s.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0 || draggedIdx === targetIdx) return;
    const newSlides = [...heroSlides];
    const [draggedItem] = newSlides.splice(draggedIdx, 1);
    newSlides.splice(targetIdx, 0, draggedItem);
    setHeroSlides(newSlides);

    try {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", ids: newSlides.map(s => s.id) }),
      });
      if (!res.ok) {
        console.error("Failed to persist slide sort order on server");
      }
    } catch (err) {
      console.error("Error updating hero slides sort order on server:", err);
    }
  };

  const updateStoreLinks = async (links: StoreLinks) => {
    setStoreLinks(links);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "store_links", value: links }),
      });
      if (!res.ok) {
        console.error("Failed to save store links on server");
      }
    } catch (err) {
      console.error("Error updating store links on server:", err);
    }
  };

  const setFilter = (category: string, subCategory: string | null) => {
    setActiveCategory(category);
    setActiveSubCategory(subCategory);
    setSearchQuery("");
  };

  // if (!isLoaded) return null; // Removed to prevent React #310 hydration crash

  return (
    <ProductContext.Provider value={{
      products,
      isLoading,
      heroSlides,
      activeCategory,
      activeSubCategory,
      searchQuery,
      storeLinks,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkDeleteProducts,
      reorderProduct,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      reorderHeroSlide,
      updateStoreLinks,
      setFilter,
      setSearchQuery
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
