"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./ProductContext";

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

  const formatPrice = (usdPrice: number) => {
    if (currency === "USD") {
      return `$${usdPrice.toLocaleString()}`;
    } else {
      // Assuming 1 USD = 15,500 IDR
      const idrPrice = usdPrice * 15500;
      return `Rp ${idrPrice.toLocaleString('id-ID')}`;
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
