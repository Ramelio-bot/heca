"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import SizeGuideModal from "./SizeGuideModal";

export default function QuickViewDrawer() {
  const { isQuickViewOpen, setIsQuickViewOpen, selectedProduct, setMarketplaceModalOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isQuickViewOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      // Reset gallery state
       
      setCurrentImageIdx(0);
       
      setIsZoomed(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isQuickViewOpen]);

  if (!isVisible && !isQuickViewOpen) return null;

  const handlePurchase = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => {
      setMarketplaceModalOpen(true);
    }, 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.targetTouches[0].clientX - touchStart;
    if (diff > 50) {
      setIsQuickViewOpen(false);
      setTouchStart(null);
    }
  };

  const onTouchEnd = () => setTouchStart(null);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isQuickViewOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsQuickViewOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-heca-bg text-heca-primary z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isQuickViewOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-8 border-b border-heca-primary/10">
          <h2 className="text-sm font-serif uppercase tracking-widest">Product Detail</h2>
          <button 
            onClick={() => setIsQuickViewOpen(false)}
            className="text-2xl font-light hover:opacity-60 transition-opacity min-h-[44px] min-w-[44px] p-2 flex items-center justify-center -mr-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {selectedProduct && (() => {
          const allMedia = [
            { type: 'image', src: selectedProduct.image },
            selectedProduct.videoUrl ? { type: 'video', src: selectedProduct.videoUrl } : null,
            selectedProduct.hoverImage ? { type: 'image', src: selectedProduct.hoverImage } : null,
            ...(selectedProduct.gallery || []).map(g => ({ type: 'image', src: g }))
          ].filter(Boolean) as { type: 'image' | 'video', src: string }[];
          
          const currentMedia = allMedia[currentImageIdx] || allMedia[0];

          return (
            <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col">
              <div 
                className="relative flex-shrink-0 w-full aspect-[3/4] bg-heca-primary/5 mb-8 overflow-hidden cursor-crosshair group"
                onMouseEnter={() => {
                  if (window.innerWidth >= 768) setIsZoomed(true);
                }}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={(e) => {
                  if (!isZoomed) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ 
                    x: ((e.clientX - rect.left) / rect.width) * 100, 
                    y: ((e.clientY - rect.top) / rect.height) * 100 
                  });
                }}
              >
                {currentMedia.type === 'video' ? (
                  <video 
                    src={currentMedia.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`object-cover w-full h-full transition-transform duration-300 ease-out ${isZoomed ? "scale-[1.8]" : "scale-100"}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                  />
                ) : (
                  <Image 
                    src={currentMedia.src}
                    alt={selectedProduct.name}
                    fill
                    className={`object-cover transition-transform duration-300 ease-out ${isZoomed ? "scale-[1.8]" : "scale-100"}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
                
                {allMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 flex-wrap justify-center w-full px-4">
                    {allMedia.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }} 
                        className={`w-2 h-2 rounded-full transition-colors ${currentImageIdx === idx ? "bg-heca-primary" : "bg-heca-primary/30"}`} 
                        aria-label={`View media ${idx + 1}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            
            <div className="flex flex-col space-y-6 flex-1">
              <div>
                <h1 className="text-2xl font-serif tracking-widest uppercase mb-2">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs uppercase tracking-widest opacity-60">
                  {selectedProduct.displayPrice}
                </p>
              </div>

              {selectedProduct.description && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Description</h3>
                  <p className="text-xs leading-relaxed opacity-80 whitespace-pre-wrap">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {selectedProduct.material && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Composition</h3>
                  <p className="text-xs uppercase tracking-widest opacity-80">
                    {selectedProduct.material}
                  </p>
                </div>
              )}

              {selectedProduct.careInstructions && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Care</h3>
                  <p className="text-xs uppercase tracking-widest opacity-80">
                    {selectedProduct.careInstructions}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-12 pb-8 flex flex-col gap-4">
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="w-full py-3 border border-heca-primary text-heca-primary bg-transparent text-[10px] uppercase tracking-[0.2em] hover:bg-heca-primary/5 transition-colors"
                >
                  Size Guide
                </button>
                <button 
                  onClick={handlePurchase}
                  className="w-full py-4 bg-heca-primary text-heca-bg text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90 transition-colors"
                >
                  Purchase Options
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} imageUrl={selectedProduct?.sizeGuideUrl} />
    </>
  );
}
