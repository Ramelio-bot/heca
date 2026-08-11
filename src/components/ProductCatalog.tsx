"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProduct, Product, ProductSize } from "@/context/ProductContext";
import { motion } from "framer-motion";

export default function ProductCatalog() {
  const { setIsQuickViewOpen, setSelectedProduct } = useCart();
  const { products, activeCategory, activeSubCategory, searchQuery, setFilter } = useProduct();
  
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ [key: number]: ProductSize }>({});

  const handleSizeSelect = (e: React.MouseEvent, productId: number, size: ProductSize) => {
    e.stopPropagation();
    setSelectedSize(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

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

      {filteredProducts.length === 0 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center space-y-4 text-heca-primary/50">
          <p className="font-serif text-2xl md:text-3xl font-light tracking-wide text-center px-4 text-heca-primary/60">No collection items available in this category.</p>
          <button onClick={() => window.location.reload()} className="text-xs uppercase tracking-widest border-b border-heca-primary/50 hover:text-heca-primary transition-colors">
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-8 max-w-[1600px] mx-auto">
          {filteredProducts.map((product, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: (i % 3) * 0.1 }}
              key={product.id} 
              className={`${product.span || "col-span-12 md:col-span-4"} group relative overflow-hidden flex flex-col cursor-pointer`}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={(e) => handleQuickView(e, product)}
            >
              <div className={`relative w-full ${product.height || "h-[60vh]"} overflow-hidden bg-[#e0d9d0] cursor-pointer`}>
                {/* Main Image */}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover object-center transition-all duration-[1500ms] ease-out group-hover:scale-105 ${
                    product.hoverImage ? "group-hover:opacity-0" : ""
                  }`}
                />
                
                {/* Hover View: Video or Image */}
                {product.videoUrl ? (
                  <video
                    src={product.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover object-center absolute inset-0 w-full h-full opacity-0 transition-all duration-[1500ms] ease-out group-hover:opacity-100 group-hover:scale-105"
                  />
                ) : product.hoverImage ? (
                  <Image
                    src={product.hoverImage}
                    alt={`${product.name} alternate view`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center absolute inset-0 opacity-0 transition-all duration-[1500ms] ease-out group-hover:opacity-100 group-hover:scale-105"
                  />
                ) : null}

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
                

                <div 
                  className={`absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className="flex gap-4 mb-4 text-white">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={(e) => handleSizeSelect(e, product.id, size as ProductSize)}
                        className={`text-xs uppercase tracking-widest border border-white/30 px-3 py-1 transition-colors ${selectedSize[product.id] === size ? 'bg-white text-black' : 'hover:border-white'}`}
                        aria-label={`Select size ${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={(e) => handleQuickView(e, product)}
                    className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest hover:bg-heca-bg transition-colors"
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
                        {product.displayPrice}
                      </span>
                      <span className="text-sm font-bold font-serif text-[#D6001C]">
                        ${(product.price * (1 - product.discountPercent / 100)).toFixed(0)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm opacity-60 font-serif">
                      {product.displayPrice}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
