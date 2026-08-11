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
  reorderProduct: (draggedId: number, targetId: number) => void;
  addHeroSlide: (slide: Omit<HeroSlide, "id">) => void;
  updateHeroSlide: (id: number, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: number) => void;
  reorderHeroSlide: (draggedId: number, targetId: number) => void;
  updateStoreLinks: (links: StoreLinks) => void;
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
  category: row.category,
  subCategory: row.sub_category || "",
  sizes: ["S", "M", "L"], // default sizes as we didn't add this column yet
  gallery: row.images,
  span: row.span || "col-span-12 md:col-span-4",
  height: row.height || "h-[60vh]",
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
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setProducts(data.map(mapRowToProduct));
      }
    } catch (err) {
      console.error("Error fetching products from Supabase:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchProducts();

    // Local Storage for Slides
    const storedSlides = localStorage.getItem("heca_hero_slides");
    if (storedSlides) {
      try {
        setHeroSlides(JSON.parse(storedSlides));
      } catch {
        setHeroSlides(DEFAULT_HERO_SLIDES);
      }
    } else {
      setHeroSlides(DEFAULT_HERO_SLIDES);
      localStorage.setItem("heca_hero_slides", JSON.stringify(DEFAULT_HERO_SLIDES));
    }

    // Local Storage for Links
    const storedLinks = localStorage.getItem("heca_store_links");
    if (storedLinks) {
      try {
        setStoreLinks(JSON.parse(storedLinks));
      } catch {}
    }

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

  // Reordering local only for now since we didn't add order col
  const reorderProduct = (draggedId: number, targetId: number) => {
    const draggedIdx = products.findIndex(p => p.id === draggedId);
    const targetIdx = products.findIndex(p => p.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0 || draggedIdx === targetIdx) return;
    const newProducts = [...products];
    const [draggedItem] = newProducts.splice(draggedIdx, 1);
    newProducts.splice(targetIdx, 0, draggedItem);
    setProducts(newProducts);
  };

  const addHeroSlide = (newSlide: Omit<HeroSlide, "id">) => {
    const newId = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.id)) + 1 : 1;
    const added: HeroSlide = { ...newSlide, id: newId };
    const updated = [...heroSlides, added];
    setHeroSlides(updated);
    localStorage.setItem("heca_hero_slides", JSON.stringify(updated));
  };

  const deleteHeroSlide = (id: number) => {
    const updated = heroSlides.filter(s => s.id !== id);
    setHeroSlides(updated);
    localStorage.setItem("heca_hero_slides", JSON.stringify(updated));
  };

  const updateHeroSlide = (id: number, updatedFields: Partial<HeroSlide>) => {
    const updated = heroSlides.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    setHeroSlides(updated);
    localStorage.setItem("heca_hero_slides", JSON.stringify(updated));
  };

  const reorderHeroSlide = (draggedId: number, targetId: number) => {
    const draggedIdx = heroSlides.findIndex(s => s.id === draggedId);
    const targetIdx = heroSlides.findIndex(s => s.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0 || draggedIdx === targetIdx) return;
    const newSlides = [...heroSlides];
    const [draggedItem] = newSlides.splice(draggedIdx, 1);
    newSlides.splice(targetIdx, 0, draggedItem);
    setHeroSlides(newSlides);
    localStorage.setItem("heca_hero_slides", JSON.stringify(newSlides));
  };

  const updateStoreLinks = (links: StoreLinks) => {
    setStoreLinks(links);
    localStorage.setItem("heca_store_links", JSON.stringify(links));
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
