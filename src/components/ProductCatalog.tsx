"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProduct, Product, ProductSize } from "@/context/ProductContext";
import { motion } from "framer-motion";
import SizeGuideModal from "./SizeGuideModal";

const CATEGORY_TABS = [
  { id: "ALL", label: "Semua Koleksi", sub: null },
  { id: "NEWBORN", label: "Newborn (0–12 Bulan)", sub: null },
  { id: "TODDLER", label: "Toddler / Batita (1–4 Tahun)", sub: null },
  { id: "BODYSUIT", label: "Bodysuit & Romper", sub: "BODYSUIT" },
  { id: "PIYAMA", label: "Piyama & Baju Tidur", sub: "PIYAMA" },
  { id: "LEGGING", label: "Legging & Bawahan", sub: "LEGGING" },
  { id: "BABY CARE", label: "Baby Care & Essentials", sub: null },
  { id: "SALE", label: "Promo Spesial", sub: "SPECIAL PRICES" },
];

function CatalogProductCard({
  product,
  index,
  formatPrice,
  onQuickView,
}: {
  product: Product;
  index: number;
  formatPrice: (price: number) => string;
  onQuickView: (product: Product, initialIndex: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);

  // Extract unique images in order
  const images = useMemo(() => {
    const raw: string[] = [];
    if (product.gallery && product.gallery.length > 0) {
      raw.push(...product.gallery);
    } else {
      if (product.image) raw.push(product.image);
      if (product.hoverImage) raw.push(product.hoverImage);
    }
    const seen = new Set<string>();
    const out: string[] = [];
    for (const img of raw) {
      const trimmed = img?.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        out.push(trimmed);
      }
    }
    return out.length > 0 ? out : [product.image];
  }, [product]);

  const hasMultiple = images.length > 1;

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultiple) return;
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultiple) return;
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setHasSwiped(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 25) {
      setHasSwiped(true);
      if (diff > 35) {
        prevSlide();
      } else if (diff < -35) {
        nextSlide();
      }
    }
    setTouchStartX(null);
  };

  const getInitialQuickViewIdx = () => {
    if (isHovered && currentIdx === 0 && images.length > 1) {
      return 1;
    }
    return currentIdx;
  };

  const handleCardClick = () => {
    if (hasSwiped) {
      setHasSwiped(false);
      return;
    }
    onQuickView(product, getInitialQuickViewIdx());
  };

  const activeImage = images[currentIdx] || images[0];
  const secondImage = images[1] || product.hoverImage;
  const displayedSlideIdx = isHovered && currentIdx === 0 && images.length > 1 ? 1 : currentIdx;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: (index % 4) * 0.06 }}
      id={`product-${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border border-[#2C2523]/8 hover:border-[#E05A47]/40 hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIdx(0);
      }}
      onClick={handleCardClick}
    >
      {/* Product Image Aspect 3:4 Container */}
      <div
        className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3EFEA]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Base Active Image */}
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={index < 4 ? "eager" : "lazy"}
          priority={index < 4}
          className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-103 ${
            isHovered && currentIdx === 0 && (product.videoUrl || secondImage) ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Hover View when at default index 0: Video or 2nd Image */}
        {currentIdx === 0 &&
          (product.videoUrl ? (
            <video
              src={product.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`object-cover object-center absolute inset-0 w-full h-full transition-all duration-500 ease-out ${
                isHovered ? "opacity-100 scale-103" : "opacity-0 scale-100"
              }`}
            />
          ) : secondImage ? (
            <Image
              src={secondImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className={`object-cover object-center absolute inset-0 transition-all duration-500 ease-out ${
                isHovered ? "opacity-100 scale-103" : "opacity-0 scale-100"
              }`}
            />
          ) : null)}

        {/* Top Left Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-[#2C2523] text-white px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
              BARU
            </span>
          )}
          {product.discountPercent ? (
            <span className="bg-[#E05A47] text-white px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
              -{product.discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Geser / Slider Arrows directly on the store card */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Gambar sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-[#2C2523] flex items-center justify-center shadow-md backdrop-blur-xs transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Gambar berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-[#2C2523] flex items-center justify-center shadow-md backdrop-blur-xs transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter Pill Top Right */}
            <div className="absolute top-2.5 right-2.5 z-10 bg-black/55 backdrop-blur-xs text-white px-2 py-0.5 text-[9px] font-mono tracking-wider rounded-full">
              {displayedSlideIdx + 1}/{images.length}
            </div>

            {/* Slide Dots Indicator Bottom */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-black/25 backdrop-blur-2xs px-2 py-1 rounded-full">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(dotIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    displayedSlideIdx === dotIdx ? "w-4 bg-white" : "w-1.5 bg-white/55"
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Info Section */}
      <div className="mt-3 flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Category & Material Tag */}
          <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#5E8C71] mb-1">
            <span className="truncate">
              {product.category} {product.subCategory ? `• ${product.subCategory}` : ""}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-[#2C2523] group-hover:text-[#E05A47] transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Size Pills (Uniqlo Baby style cm / age sizes) */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.sizes.slice(0, 5).map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(size as ProductSize);
                }}
                className={`text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  selectedSize === size
                    ? "bg-[#2C2523] text-white border-[#2C2523]"
                    : "bg-[#FAF7F2] text-[#2C2523]/75 border-[#2C2523]/12 hover:border-[#2C2523]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Price & Quick Action */}
        <div className="pt-2.5 border-t border-[#2C2523]/8 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.discountPercent ? (
              <>
                <span className="text-[10px] text-[#2C2523]/45 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#E05A47]">
                  {formatPrice(product.price * (1 - product.discountPercent / 100))}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-[#2C2523]">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, getInitialQuickViewIdx());
            }}
            className="px-3 py-1.5 rounded-full bg-[#FAF7F2] group-hover:bg-[#E05A47] text-[#2C2523] group-hover:text-white text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Detail →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductCatalog() {
  const { openQuickView, formatPrice } = useCart();
  const { products, isLoading, activeCategory, activeSubCategory, searchQuery, setFilter, setSearchQuery } = useProduct();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string | null>(null);

  // Filter products intelligently
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query override
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.subCategory.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      } else {
        // Category filter ("ALL" matches everything)
        if (activeCategory && activeCategory.toUpperCase() !== "ALL") {
          const catMatch =
            product.category.toLowerCase() === activeCategory.toLowerCase() ||
            product.subCategory.toLowerCase() === activeCategory.toLowerCase();
          if (!catMatch) return false;
        }

        // Subcategory filter
        if (activeSubCategory) {
          if (activeSubCategory === "THE NEW") {
            if (!product.isNew) return false;
          } else if (activeSubCategory === "SPECIAL PRICES") {
            if ((product.discountPercent ?? 0) <= 0) return false;
          } else {
            const subUpper = activeSubCategory.toUpperCase();
            const matchesSub =
              product.subCategory.toUpperCase().includes(subUpper) ||
              product.category.toUpperCase().includes(subUpper) ||
              product.name.toUpperCase().includes(subUpper);
            if (!matchesSub) return false;
          }
        }
      }

      // Size filter pill
      if (selectedSizeFilter) {
        const hasSize = product.sizes.some(
          (s) => s.toLowerCase() === selectedSizeFilter.toLowerCase()
        );
        if (!hasSize) return false;
      }

      return true;
    });
  }, [products, activeCategory, activeSubCategory, searchQuery, selectedSizeFilter]);

  // Available unique sizes across products for quick filtering
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  return (
    <section id="catalog" className="w-full bg-[#FAF7F2] text-[#2C2523] px-4 sm:px-6 lg:px-10 py-10 md:py-16 font-sans min-h-[70vh]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#E9F0EB] text-[#3D6B52] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                OEKO-TEX® STANDARD 100
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#2C2523]/55">
                • {filteredProducts.length} Produk Tersedia
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2523]">
              {searchQuery.trim() !== ""
                ? `Hasil Pencarian: "${searchQuery}"`
                : activeCategory === "ALL" && !activeSubCategory
                ? "Katalog Pakaian & Perlengkapan Bayi"
                : `${activeCategory === "ALL" ? "Koleksi" : activeCategory} ${
                    activeSubCategory ? `— ${activeSubCategory}` : ""
                  }`}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {(activeCategory !== "ALL" || activeSubCategory || searchQuery || selectedSizeFilter) && (
              <button
                type="button"
                onClick={() => {
                  setFilter("ALL", null);
                  setSearchQuery("");
                  setSelectedSizeFilter(null);
                }}
                className="text-xs font-semibold text-[#E05A47] hover:underline cursor-pointer"
              >
                Reset Filter ×
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="px-4 py-2 rounded-full bg-white border border-[#2C2523]/15 hover:border-[#2C2523] text-xs font-semibold transition-colors cursor-pointer"
            >
              📏 Tabel Ukuran Bayi (cm)
            </button>
          </div>
        </div>

        {/* Category Filter Tabs (Scrollable on HP/TAB, Wrap on Desktop) */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-4 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => {
            const isSelected =
              (tab.id === "ALL" && activeCategory === "ALL" && !activeSubCategory) ||
              (tab.sub && activeSubCategory === tab.sub) ||
              (!tab.sub && tab.id !== "ALL" && activeCategory.toUpperCase() === tab.id && !activeSubCategory);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.sub) {
                    setFilter("ALL", tab.sub);
                  } else {
                    setFilter(tab.id, null);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#2C2523] text-white shadow-xs"
                    : "bg-white border border-[#2C2523]/10 text-[#2C2523]/75 hover:border-[#2C2523]/30 hover:text-[#2C2523]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Filter by Baby Size (cm) */}
        {availableSizes.length > 0 && (
          <div className="flex items-center overflow-x-auto gap-1.5 pb-4 mb-6 border-b border-[#2C2523]/10 scrollbar-hide">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2C2523]/50 mr-2 shrink-0">
              Filter Ukuran:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSizeFilter(null)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSizeFilter === null
                  ? "bg-[#E05A47] text-white"
                  : "bg-white border border-[#2C2523]/10 text-[#2C2523]/70 hover:border-[#2C2523]"
              }`}
            >
              Semua Ukuran
            </button>
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSizeFilter(selectedSizeFilter === sz ? null : sz)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedSizeFilter === sz
                    ? "bg-[#E05A47] text-white"
                    : "bg-white border border-[#2C2523]/10 text-[#2C2523]/70 hover:border-[#2C2523]"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid: 2 Columns on HP, 3 Columns on TAB, 4 Columns on DESKTOP */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-[#2C2523]/5 animate-pulse flex flex-col"
              >
                <div className="w-full aspect-[3/4] bg-[#F3EFEA] rounded-xl mb-3" />
                <div className="h-3 bg-[#F3EFEA] w-1/2 rounded mb-2" />
                <div className="h-4 bg-[#F3EFEA] w-3/4 rounded mb-3" />
                <div className="h-4 bg-[#F3EFEA] w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-20 bg-white rounded-3xl border border-[#2C2523]/10 flex flex-col items-center justify-center space-y-3 text-center px-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E05A47]">
              HECA BABY CATALOG
            </span>
            <h3 className="font-serif text-2xl md:text-4xl font-bold text-[#2C2523]">
              Koleksi Sedang Disiapkan
            </h3>
            <p className="text-xs text-[#2C2523]/65 max-w-md leading-relaxed">
              Katalog produk bayi sedang diperbarui. Silakan tambahkan produk melalui halaman Admin.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="w-full py-16 bg-white rounded-3xl border border-[#2C2523]/10 flex flex-col items-center justify-center space-y-4 text-center px-4">
            <p className="font-serif text-xl md:text-2xl font-bold text-[#2C2523]">
              Tidak ada produk yang cocok dengan filter ini.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("ALL", null);
                setSearchQuery("");
                setSelectedSizeFilter(null);
              }}
              className="px-6 py-2.5 rounded-full bg-[#2C2523] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#E05A47] transition-colors cursor-pointer"
            >
              Tampilkan Semua Produk Bayi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {filteredProducts.map((product, i) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                index={i}
                formatPrice={formatPrice}
                onQuickView={openQuickView}
              />
            ))}
          </div>
        )}
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </section>
  );
}
