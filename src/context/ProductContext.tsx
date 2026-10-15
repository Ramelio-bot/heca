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
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("WOMAN");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [storeLinks, setStoreLinks] = useState<StoreLinks>({
    shopee: "https://shopee.co.id/heca.official",
    tokopedia: "https://tokopedia.com/hecaofficial",
    tiktok: "https://tiktok.com/@heca.official",
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
    const { data, error } = await supabase
      .from('heca_products')
      .insert([row])
      .select()
      .single();
    
    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    if (data) {
      setProducts(prev => [mapRowToProduct(data), ...prev]);
    }
  };

  const updateProduct = async (id: number, updatedFields: Partial<Product>) => {
    const row = mapProductToRow(updatedFields);
    const { error } = await supabase
      .from('heca_products')
      .update(row)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = async (id: number) => {
    const { error } = await supabase
      .from('heca_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const bulkDeleteProducts = async (ids: number[]) => {
    const { error } = await supabase
      .from('heca_products')
      .delete()
      .in('id', ids);
    
    if (error) {
      console.error("Error deleting products:", error);
      throw error;
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
      const updates = newProducts.map((p, idx) =>
        supabase.from('heca_products').update({ sort_order: idx + 1 }).eq('id', p.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Error updating sort_order in Supabase:", err);
    }
  };

  const addHeroSlide = async (newSlide: Omit<HeroSlide, "id">) => {
    const nextSortOrder = heroSlides.length + 1;
    const { data, error } = await supabase
      .from('heca_hero_slides')
      .insert([{
        type: newSlide.type,
        url: newSlide.url,
        sort_order: nextSortOrder,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding hero slide to Supabase:", error);
      return;
    }
    if (data) {
      setHeroSlides(prev => [...prev, data]);
    }
  };

  const deleteHeroSlide = async (id: number) => {
    const { error } = await supabase
      .from('heca_hero_slides')
      .delete()
      .eq('id', id);
    if (error) {
      console.error("Error deleting hero slide from Supabase:", error);
      return;
    }
    setHeroSlides(prev => prev.filter(s => s.id !== id));
  };

  const updateHeroSlide = async (id: number, updatedFields: Partial<HeroSlide>) => {
    const { error } = await supabase
      .from('heca_hero_slides')
      .update(updatedFields)
      .eq('id', id);
    if (error) {
      console.error("Error updating hero slide in Supabase:", error);
      return;
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
      const updates = newSlides.map((s, idx) =>
        supabase.from('heca_hero_slides').update({ sort_order: idx + 1 }).eq('id', s.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Error updating hero slides sort order in Supabase:", err);
    }
  };

  const updateStoreLinks = async (links: StoreLinks) => {
    setStoreLinks(links);
    try {
      const { error } = await supabase
        .from('heca_settings')
        .upsert({ key: 'store_links', value: links }, { onConflict: 'key' });
      if (error) {
        console.error("Error saving store links to Supabase:", error);
      }
    } catch (err) {
      console.error("Error updating store links in Supabase:", err);
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
