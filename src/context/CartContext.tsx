"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "./ProductContext";
import { supabase } from "@/lib/supabaseClient";

export type Currency = "USD" | "IDR";

interface UIContextType {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isMarketplaceModalOpen: boolean;
  setMarketplaceModalOpen: (open: boolean) => void;
  isQuickViewOpen: boolean;
  setIsQuickViewOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  fxRate: number;
  updateFxRate: (rate: number) => Promise<void>;
  formatPrice: (usdPrice: number) => string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMarketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [fxRate, setFxRate] = useState<number>(15500);

  useEffect(() => {
    async function loadFxRate() {
      try {
        const { data } = await supabase
          .from("heca_settings")
          .select("value")
          .eq("key", "fx_rate")
          .single();
        if (data && data.value) {
          setFxRate(Number(data.value));
        }
      } catch (err) {
        console.error("Error loading fx_rate:", err);
      }
    }
    loadFxRate();
  }, []);

  const updateFxRate = async (rate: number) => {
    setFxRate(rate);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "fx_rate", value: rate }),
      });
      if (!res.ok) {
        console.error("Failed to update fx_rate on server");
      }
    } catch (err) {
      console.error("Failed to update fx_rate on server:", err);
    }
  };

  const formatPrice = (usdPrice: number) => {
    if (currency === "USD") {
      return `$${usdPrice.toLocaleString()}`;
    } else {
      const idrPrice = Math.round(usdPrice * fxRate);
      return `Rp ${idrPrice.toLocaleString("id-ID")}`;
    }
  };

  return (
    <UIContext.Provider
      value={{
        isNavOpen,
        setNavOpen,
        isHelpOpen,
        setIsHelpOpen,
        isMarketplaceModalOpen,
        setMarketplaceModalOpen,
        isQuickViewOpen,
        setIsQuickViewOpen,
        selectedProduct,
        setSelectedProduct,
        currency,
        setCurrency,
        fxRate,
        updateFxRate,
        formatPrice,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useCart() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
