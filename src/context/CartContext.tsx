"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./ProductContext";

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
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMarketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
