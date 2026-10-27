"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import SizeGuideModal from "./SizeGuideModal";
import PaypalCheckout from "./PaypalCheckout";

export default function QuickViewDrawer() {
  const { 
    isQuickViewOpen, 
    setIsQuickViewOpen, 
    selectedProduct, 
    setMarketplaceModalOpen, 
    formatPrice,
    quickViewInitialIndex,
  } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPaypalCheckoutOpen, setIsPaypalCheckoutOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [imageTouchStartX, setImageTouchStartX] = useState<number | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isQuickViewOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      setCurrentImageIdx(quickViewInitialIndex || 0);
      setIsZoomed(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isQuickViewOpen, quickViewInitialIndex]);

  // Deduplicate and assemble full media list
  const allMedia = React.useMemo(() => {
    if (!selectedProduct) return [];
    const list: { type: 'image' | 'video'; src: string }[] = [];
    if (selectedProduct.videoUrl) {
      list.push({ type: 'video', src: selectedProduct.videoUrl });
    }
    const raw: string[] = [];
    if (selectedProduct.gallery && selectedProduct.gallery.length > 0) {
      raw.push(...selectedProduct.gallery);
    } else {
      if (selectedProduct.image) raw.push(selectedProduct.image);
      if (selectedProduct.hoverImage) raw.push(selectedProduct.hoverImage);
    }
    const seen = new Set<string>();
    for (const img of raw) {
      const trimmed = img?.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        list.push({ type: 'image', src: trimmed });
      }
    }
    return list.length > 0 ? list : [{ type: 'image' as const, src: selectedProduct.image }];
  }, [selectedProduct]);

  const mediaCount = allMedia.length;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (mediaCount <= 1) return;
    setCurrentImageIdx((prev) => (prev + 1) % mediaCount);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (mediaCount <= 1) return;
    setCurrentImageIdx((prev) => (prev - 1 + mediaCount) % mediaCount);
  };

  const onImageTouchStart = (e: React.TouchEvent) => {
    setImageTouchStartX(e.targetTouches[0].clientX);
  };

  const onImageTouchEnd = (e: React.TouchEvent) => {
    if (imageTouchStartX === null) return;
    const diff = e.changedTouches[0].clientX - imageTouchStartX;
    if (diff > 40) {
      prevImage();
    } else if (diff < -40) {
      nextImage();
    }
    setImageTouchStartX(null);
  };

  // Keyboard navigation when drawer is open
  useEffect(() => {
    if (!isQuickViewOpen || mediaCount <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentImageIdx(prev => (prev - 1 + mediaCount) % mediaCount);
      } else if (e.key === "ArrowRight") {
        setCurrentImageIdx(prev => (prev + 1) % mediaCount);
      } else if (e.key === "Escape") {
        setIsQuickViewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuickViewOpen, mediaCount, setIsQuickViewOpen]);

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
            aria-label="Close product details"
            className="text-2xl font-light hover:opacity-60 transition-opacity min-h-[44px] min-w-[44px] p-2 flex items-center justify-center -mr-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {selectedProduct && (() => {
          const currentMedia = allMedia[currentImageIdx] || allMedia[0];

          return (
            <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col">
              <div 
                className="relative flex-shrink-0 w-full aspect-[3/4] bg-heca-primary/5 mb-4 overflow-hidden cursor-crosshair group select-none"
                onTouchStart={onImageTouchStart}
                onTouchEnd={onImageTouchEnd}
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
                    loading="lazy"
                    className={`object-cover transition-transform duration-300 ease-out ${isZoomed ? "scale-[1.8]" : "scale-100"}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
                
                {/* Navigation Arrows for sliding */}
                {mediaCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Counter Badge */}
                    <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase rounded">
                      {currentImageIdx + 1} / {mediaCount}
                    </div>

                    {/* Bottom dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 flex-wrap justify-center px-4">
                      {allMedia.map((_, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }} 
                          className={`h-1.5 rounded-full transition-all ${currentImageIdx === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} 
                          aria-label={`View media ${idx + 1}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails row to quickly click & switch any of the 5 images */}
              {mediaCount > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-thin">
                  {allMedia.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`relative w-16 h-20 shrink-0 border overflow-hidden transition-all ${
                        currentImageIdx === idx
                          ? "border-heca-primary ring-2 ring-heca-primary/40 scale-102"
                          : "border-heca-primary/20 opacity-50 hover:opacity-100"
                      }`}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full bg-black/80 flex items-center justify-center text-[9px] text-white uppercase tracking-wider font-mono">
                          Video
                        </div>
                      ) : (
                        <Image
                          src={m.src}
                          alt={`${selectedProduct.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            
            <div className="flex flex-col space-y-6 flex-1">
              <div>
                <h1 className="text-2xl font-serif tracking-widest uppercase mb-2">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs uppercase tracking-widest opacity-60">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              {/* Size Selector */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest opacity-40 mb-3 font-bold">Select Size</h3>
                <div className="flex gap-2">
                  {(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes : ["S", "M", "L"]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`w-10 h-10 border text-xs tracking-widest flex items-center justify-center transition-all ${
                        selectedSize === sz
                          ? "border-heca-primary bg-heca-primary text-heca-bg font-bold scale-105"
                          : "border-heca-primary/30 text-heca-primary hover:border-heca-primary"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
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

              <div className="mt-auto pt-10 pb-8 flex flex-col gap-3">
                <button 
                  onClick={() => setIsPaypalCheckoutOpen(true)}
                  className="w-full py-4 bg-heca-primary text-heca-bg text-xs uppercase tracking-[0.2em] font-semibold hover:bg-heca-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Checkout with PayPal</span>
                  <span className="opacity-50 text-[10px] font-normal">· Instant Order</span>
                </button>
                <button 
                  onClick={handlePurchase}
                  className="w-full py-3.5 border border-heca-primary/40 text-heca-primary bg-transparent text-[10px] uppercase tracking-[0.2em] hover:bg-heca-primary/5 transition-colors"
                >
                  Purchase via Marketplace (Shopee / Tokopedia / TikTok / Etsy / Amazon / Alibaba)
                </button>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="w-full py-2 text-heca-primary/60 text-[10px] uppercase tracking-[0.15em] hover:text-heca-primary transition-colors text-center"
                >
                  View Size Guide
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} imageUrl={selectedProduct?.sizeGuideUrl} />

      {isPaypalCheckoutOpen && selectedProduct && (
        <PaypalCheckout
          product={selectedProduct}
          selectedSize={selectedSize}
          onClose={() => setIsPaypalCheckoutOpen(false)}
        />
      )}
    </>
  );
}
