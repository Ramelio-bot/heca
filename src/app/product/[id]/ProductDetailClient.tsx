"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, ProductSize, useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import PaypalCheckout from "@/components/PaypalCheckout";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { formatPrice } = useCart();
  const { storeLinks } = useProduct();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    (product.sizes?.[0] as ProductSize) || "M"
  );
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [isPaypalOpen, setIsPaypalOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Deduplicate and assemble all media items
  const allMedia = React.useMemo(() => {
    const list: { type: "image" | "video"; src: string }[] = [];
    if (product.videoUrl) {
      list.push({ type: "video", src: product.videoUrl });
    }
    const raw: string[] = [];
    if (product.gallery && product.gallery.length > 0) {
      raw.push(...product.gallery);
    } else {
      if (product.image) raw.push(product.image);
      if (product.hoverImage) raw.push(product.hoverImage);
    }
    const seen = new Set<string>();
    for (const img of raw) {
      const trimmed = img?.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        list.push({ type: "image", src: trimmed });
      }
    }
    return list.length > 0 ? list : [{ type: "image" as const, src: product.image }];
  }, [product]);

  const mediaCount = allMedia.length;

  const nextSlide = () => {
    if (mediaCount <= 1) return;
    setCurrentMediaIdx((prev) => (prev + 1) % mediaCount);
  };

  const prevSlide = () => {
    if (mediaCount <= 1) return;
    setCurrentMediaIdx((prev) => (prev - 1 + mediaCount) % mediaCount);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 40) {
      prevSlide();
    } else if (diff < -40) {
      nextSlide();
    }
    setTouchStartX(null);
  };

  const currentMedia = allMedia[currentMediaIdx] || allMedia[0];
  const finalPrice = product.discountPercent
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Media Gallery (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div 
            className="relative w-full aspect-[3/4] bg-[#e0d9d0] overflow-hidden select-none group"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentMedia.type === "video" ? (
              <video
                src={currentMedia.src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={currentMedia.src}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-opacity duration-300"
              />
            )}

            {/* Navigation Arrows for sliding */}
            {mediaCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1 text-xs font-mono tracking-wider rounded">
                  {currentMediaIdx + 1} / {mediaCount}
                </div>
              </>
            )}

            {/* Badges */}
            {product.isNew && (
              <div className="absolute top-6 left-6 bg-white/95 text-black px-3 py-1.5 text-[10px] uppercase font-serif font-bold tracking-widest shadow-sm">
                NEW ARCHIVE
              </div>
            )}
            {product.discountPercent ? (
              <div className="absolute top-6 right-6 bg-[#D6001C] text-white px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest shadow-sm">
                SALE -{product.discountPercent}%
              </div>
            ) : null}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allMedia.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentMediaIdx(idx)}
                  className={`relative w-20 h-24 flex-shrink-0 border transition-all ${
                    currentMediaIdx === idx
                      ? "border-heca-primary scale-102"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View media visual ${idx + 1}`}
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center text-[9px] text-white uppercase tracking-wider">
                      Video
                    </div>
                  ) : (
                    <Image
                      src={m.src}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Controls (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-8 sticky top-28">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-50 mb-2">
              {product.category} {product.subCategory ? `— ${product.subCategory}` : ""}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 mt-4">
              {product.discountPercent ? (
                <>
                  <span className="font-serif text-2xl font-bold text-[#D6001C]">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-sm uppercase tracking-widest line-through opacity-40">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-serif text-2xl font-medium tracking-wider">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-heca-primary/15" />

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                Select Size
              </span>
              <span className="text-[10px] uppercase tracking-widest opacity-40">
                Standard Fit
              </span>
            </div>
            <div className="flex gap-2">
              {(product.sizes || ["S", "M", "L"]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz as ProductSize)}
                  className={`w-12 h-12 border text-xs tracking-widest flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? "border-heca-primary bg-heca-primary text-heca-bg font-bold scale-105"
                      : "border-heca-primary/20 hover:border-heca-primary text-heca-primary"
                  }`}
                  aria-label={`Select size ${sz}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPaypalOpen(true)}
              className="w-full bg-heca-primary text-heca-bg py-4 text-xs uppercase tracking-[0.25em] font-bold hover:bg-heca-primary/90 transition-all cursor-pointer shadow-md"
            >
              Buy with PayPal
            </button>

            {/* Marketplace Alternatives */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {(product.shopeeUrl || storeLinks?.shopee) && (
                <a
                  href={product.shopeeUrl || storeLinks.shopee}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  Shopee
                </a>
              )}
              {(product.tokopediaUrl || storeLinks?.tokopedia) && (
                <a
                  href={product.tokopediaUrl || storeLinks.tokopedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  Tokopedia
                </a>
              )}
              {(product.tiktokUrl || storeLinks?.tiktok) && (
                <a
                  href={product.tiktokUrl || storeLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  TikTok
                </a>
              )}
              {(product.etsyUrl || storeLinks?.etsy) && (
                <a
                  href={product.etsyUrl || storeLinks.etsy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  Etsy
                </a>
              )}
              {(product.amazonUrl || storeLinks?.amazon) && (
                <a
                  href={product.amazonUrl || storeLinks.amazon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  Amazon
                </a>
              )}
              {(product.alibabaUrl || storeLinks?.alibaba) && (
                <a
                  href={product.alibabaUrl || storeLinks.alibaba}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[10px] uppercase tracking-widest border border-heca-primary/20 text-center hover:border-heca-primary transition-colors"
                >
                  Alibaba
                </a>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-heca-primary/15" />

          {/* Description & Specifications */}
          <div className="space-y-4 text-xs uppercase tracking-wider leading-relaxed">
            {product.description && (
              <div>
                <h3 className="font-bold text-[10px] opacity-40 mb-1">Curatorial Note</h3>
                <p className="opacity-80 leading-loose normal-case font-sans">
                  {product.description}
                </p>
              </div>
            )}

            {product.material && (
              <div>
                <h3 className="font-bold text-[10px] opacity-40 mb-1">Composition</h3>
                <p className="opacity-80 font-mono text-[11px]">{product.material}</p>
              </div>
            )}

            {product.careInstructions && (
              <div>
                <h3 className="font-bold text-[10px] opacity-40 mb-1">Garment Care</h3>
                <p className="opacity-80 font-mono text-[11px]">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PayPal Modal */}
      {isPaypalOpen && (
        <PaypalCheckout
          product={product}
          selectedSize={selectedSize}
          onClose={() => setIsPaypalOpen(false)}
        />
      )}
    </>
  );
}
