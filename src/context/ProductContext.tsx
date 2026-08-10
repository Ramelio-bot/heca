"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MOCK_PRODUCTS_50 } from "@/data/mockProducts";

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
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  bulkDeleteProducts: (ids: number[]) => void;
  reorderProduct: (draggedId: number, targetId: number) => void;
  addHeroSlide: (slide: Omit<HeroSlide, "id">) => void;
  updateHeroSlide: (id: number, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: number) => void;
  reorderHeroSlide: (draggedId: number, targetId: number) => void;
  updateStoreLinks: (links: StoreLinks) => void;
  setFilter: (category: string, subCategory: string | null) => void;
  setSearchQuery: (query: string) => void;
}

const DEFAULT_PRODUCTS: Product[] = MOCK_PRODUCTS_50 as unknown as Product[];

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { id: 1, type: "image", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" },
  { id: 2, type: "image", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop" },
  { id: 3, type: "image", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop" },
  { id: 4, type: "image", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop" },
  { id: 5, type: "image", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1920&auto=format&fit=crop" }
];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("heca_products");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts(JSON.parse(stored));
      } catch {
         
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
       
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem("heca_products", JSON.stringify(DEFAULT_PRODUCTS));
    }

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

    const storedLinks = localStorage.getItem("heca_store_links");
    if (storedLinks) {
      try {
        setStoreLinks(JSON.parse(storedLinks));
      } catch {}
    }

    setIsLoaded(true);
  }, []);

  const addProduct = (newProduct: Omit<Product, "id">) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const added: Product = {
      ...newProduct,
      id: newId,
      span: "col-span-12 md:col-span-4",
      height: "h-[60vh]",
    };
    const updated = [added, ...products];
    setProducts(updated);
    localStorage.setItem("heca_products", JSON.stringify(updated));
  };

  const updateProduct = (id: number, updatedFields: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setProducts(updated);
    localStorage.setItem("heca_products", JSON.stringify(updated));
  };

  const deleteProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem("heca_products", JSON.stringify(updated));
  };

  const bulkDeleteProducts = (ids: number[]) => {
    const updated = products.filter(p => !ids.includes(p.id));
    setProducts(updated);
    localStorage.setItem("heca_products", JSON.stringify(updated));
  };

  const reorderProduct = (draggedId: number, targetId: number) => {
    const draggedIdx = products.findIndex(p => p.id === draggedId);
    const targetIdx = products.findIndex(p => p.id === targetId);
    
    if (draggedIdx < 0 || targetIdx < 0 || draggedIdx === targetIdx) return;

    const newProducts = [...products];
    const [draggedItem] = newProducts.splice(draggedIdx, 1);
    newProducts.splice(targetIdx, 0, draggedItem);
    
    setProducts(newProducts);
    localStorage.setItem("heca_products", JSON.stringify(newProducts));
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

  if (!isLoaded) return null;

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
