"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProduct, Product, ProductSize } from "@/context/ProductContext";
import { motion } from "framer-motion";

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

  // Determine which image index to open in quick view:
  // If user is hovering at index 0 and 2nd image is available, the hover image was showing -> open index 1
  // Otherwise open currentIdx
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: (index % 3) * 0.1 }}
      key={product.id} 
      id={`product-${product.id}`}
      className={`${product.span || "col-span-12 md:col-span-4"} group relative overflow-hidden flex flex-col cursor-pointer select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIdx(0);
      }}
      onClick={handleCardClick}
    >
      <div 
        className={`relative w-full ${product.height || "h-[60vh]"} overflow-hidden bg-[#e0d9d0] cursor-pointer`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Base Active Image */}
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading={index < 3 ? "eager" : "lazy"}
          priority={index < 3}
          className={`object-cover object-center transition-all duration-[700ms] ease-out group-hover:scale-105 ${
            isHovered && currentIdx === 0 && (product.videoUrl || secondImage) ? "opacity-0" : "opacity-100"
          }`}
        />
        
        {/* Hover View when at default index 0: Catwalk Video or 2nd Image */}
        {currentIdx === 0 && (
          product.videoUrl ? (
            <video
              src={product.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`object-cover object-center absolute inset-0 w-full h-full transition-all duration-[700ms] ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          ) : secondImage ? (
            <Image
              src={secondImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className={`object-cover object-center absolute inset-0 transition-all duration-[700ms] ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          ) : null
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-0" />
        
        {/* Badges */}
        {product.isNew && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 text-black px-2 py-1 text-[10px] uppercase font-serif font-bold tracking-widest shadow-sm">
            NEW
          </div>
        )}
        {product.discountPercent ? (
          <div className="absolute top-4 right-4 z-10 bg-[#D6001C] text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest shadow-sm">
            SALE -{product.discountPercent}%
          </div>
        ) : null}

        {/* Geser / Slider Arrows directly on the store card */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 transition-opacity duration-300">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(dotIdx);
                  }}
                  className={`h-1 rounded-full transition-all ${
                    (isHovered && currentIdx === 0 && images.length > 1 ? 1 : currentIdx) === dotIdx
                      ? "w-4 bg-white"
                      : "w-1 bg-white/40"
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Counter pill */}
            <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 text-[9px] font-mono tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {(isHovered && currentIdx === 0 && images.length > 1 ? 1 : currentIdx) + 1} / {images.length}
            </div>
          </>
        )}

        {/* Hover Bottom Action Drawer */}
        <div 
          className={`absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex gap-3 mb-4 text-white">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(size as ProductSize);
                }}
                className={`text-xs uppercase tracking-widest border border-white/30 px-3 py-1 transition-colors ${
                  selectedSize === size ? 'bg-white text-black font-semibold' : 'hover:border-white'
                }`}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, getInitialQuickViewIdx());
            }}
            className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest hover:bg-heca-bg transition-colors font-medium"
            aria-label={`View ${product.name} details`}
          >
            Quick View
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-baseline px-2">
        <h3 className="text-sm font-medium uppercase tracking-wider group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          {product.discountPercent ? (
            <>
              <span className="text-xs opacity-40 font-serif line-through decoration-heca-primary/50">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-bold font-serif text-[#D6001C]">
                {formatPrice(product.price * (1 - product.discountPercent / 100))}
              </span>
            </>
          ) : (
            <span className="text-sm opacity-60 font-serif">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductCatalog() {
  const { openQuickView, formatPrice } = useCart();
  const { products, isLoading, activeCategory, activeSubCategory, searchQuery, setFilter } = useProduct();

  // Filter products based on active category, subcategory, and search query (case-insensitive)
  const filteredProducts = products.filter(product => {
    const matchCategory = product.category.toLowerCase() === activeCategory.toLowerCase();
    
    // If there's a search query, it overrides category navigation
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.subCategory.toLowerCase().includes(q)
      );
    }

    if (!matchCategory) return false;
    
    if (activeSubCategory) {
      if (activeSubCategory === "THE NEW") return !!product.isNew;
      if (activeSubCategory === "SPECIAL PRICES") return (product.discountPercent ?? 0) > 0;
      return product.subCategory.toLowerCase() === activeSubCategory.toLowerCase();
    }
    return true; // if no subcategory selected, show all for that category
  });

  // Get unique subcategories for the active category
  const dynamicSubCategories = Array.from(
    new Set(products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase()).map(p => p.subCategory))
  ).filter(Boolean);

  return (
    <section id="catalog" className="w-full bg-heca-bg text-heca-primary px-4 md:px-8 py-20 font-sans min-h-[80vh]">
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-serif mb-4 uppercase tracking-widest">
          The Archive
        </h2>
        <p className="text-sm uppercase tracking-widest opacity-60">
          {searchQuery.trim() !== "" ? `SEARCH RESULTS FOR "${searchQuery}"` : `${activeCategory} ${activeSubCategory ? `— ${activeSubCategory}` : "COLLECTION"}`}
        </p>
      </div>

      {/* Mobile Horizontal Subcategory Pills */}
      {searchQuery.trim() === "" && dynamicSubCategories.length > 0 && (
        <div className="md:hidden flex overflow-x-auto gap-3 pb-4 mb-8 -mx-4 px-4 scrollbar-hide snap-x">
          <button 
            onClick={() => setFilter(activeCategory, null)}
            className={`flex-shrink-0 snap-start border px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors rounded-full ${
              !activeSubCategory ? "bg-heca-primary text-heca-bg border-heca-primary" : "border-heca-primary/30 hover:border-heca-primary"
            }`}
          >
            ALL {activeCategory}
          </button>
          {dynamicSubCategories.map(subCat => (
            <button 
              key={subCat}
              onClick={() => setFilter(activeCategory, subCat)}
              className={`flex-shrink-0 snap-start border px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors rounded-full ${
                activeSubCategory === subCat ? "bg-heca-primary text-heca-bg border-heca-primary" : "border-heca-primary/30 hover:border-heca-primary"
              }`}
            >
              {subCat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-12 gap-4 md:gap-8 max-w-[1600px] mx-auto">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="col-span-12 md:col-span-4 h-[60vh] bg-heca-primary/5 animate-pulse flex flex-col justify-end p-6">
              <div className="h-4 bg-heca-primary/10 w-3/4 mb-2"></div>
              <div className="h-3 bg-heca-primary/10 w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="w-full py-28 flex flex-col items-center justify-center space-y-4 text-center px-4">
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono">
            New Archive
          </span>
          <h3 className="font-serif text-3xl md:text-5xl font-light tracking-wide uppercase">
            Collection In Curation
          </h3>
          <p className="text-xs uppercase tracking-widest opacity-60 max-w-md leading-relaxed">
            The archive is currently empty and being refreshed with genuine contemporary pieces. Please check back soon or use the admin panel to add products.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center space-y-4 text-heca-primary/50">
          <p className="font-serif text-2xl md:text-3xl font-light tracking-wide text-center px-4 text-heca-primary/60">
            No collection items available in this category.
          </p>
          <button 
            onClick={() => setFilter("WOMAN", null)} 
            className="text-xs uppercase tracking-widest border-b border-heca-primary/50 hover:text-heca-primary transition-colors py-1"
          >
            Explore All Archives
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-8 max-w-[1600px] mx-auto">
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
    </section>
  );
}
