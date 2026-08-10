"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";

export default function MarketplaceModal() {
  const { isMarketplaceModalOpen, setMarketplaceModalOpen, selectedProduct, setSelectedProduct } = useCart();
  const { storeLinks } = useProduct();

  if (!isMarketplaceModalOpen || !selectedProduct) return null;

  const handleClose = () => {
    setMarketplaceModalOpen(false);
    setSelectedProduct(null);
  };

  const finalPrice = selectedProduct.discountPercent 
    ? selectedProduct.price * (1 - selectedProduct.discountPercent / 100) 
    : selectedProduct.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-heca-bg w-full max-w-md md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative text-heca-primary font-sans animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 z-20 hover:opacity-60 transition-opacity bg-heca-bg/50 backdrop-blur rounded-full p-2.5"
          aria-label="Close modal"
        >
          <X size={24} strokeWidth={1} />
        </button>

        {/* Product Image Section */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-[70vh] bg-[#e0d9d0]">
          <Image 
            src={selectedProduct.image} 
            alt={selectedProduct.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Action Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between h-full overflow-y-auto">
          <div>
            <h2 className="text-sm font-serif uppercase tracking-widest opacity-60 mb-2">
              {selectedProduct.category} / {selectedProduct.subCategory}
            </h2>
            <h1 className="text-2xl md:text-3xl font-medium uppercase tracking-widest mb-6">
              {selectedProduct.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              {selectedProduct.discountPercent ? (
                <>
                  <span className="text-sm opacity-40 font-serif line-through decoration-heca-primary/50">
                    {selectedProduct.displayPrice}
                  </span>
                  <span className="text-xl font-bold font-serif text-[#D6001C]">
                    ${finalPrice.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-xl opacity-80 font-serif">
                  {selectedProduct.displayPrice}
                </span>
              )}
            </div>

            <p className="text-xs uppercase tracking-widest leading-loose opacity-70 mb-12 border-l border-heca-primary/30 pl-4">
              Select your preferred store to complete this purchase. You will be securely redirected to the official Heca marketplace.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <a 
              href={selectedProduct.shopeeUrl || storeLinks.shopee} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full border border-[#EE4D2D] text-[#EE4D2D] py-4 text-center text-xs uppercase tracking-[0.2em] hover:bg-[#EE4D2D] hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              BUY ON SHOPEE
            </a>
            
            <a 
              href={selectedProduct.tokopediaUrl || storeLinks.tokopedia} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full border border-[#42B549] text-[#42B549] py-4 text-center text-xs uppercase tracking-[0.2em] hover:bg-[#42B549] hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              BUY ON TOKOPEDIA
            </a>
            
            <a 
              href={selectedProduct.tiktokUrl || storeLinks.tiktok} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full border border-black text-black py-4 text-center text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              BUY ON TIKTOK SHOP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
