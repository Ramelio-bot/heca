"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  {
    name: "WOMAN",
    sections: [
      {
        title: "NEW IN",
        links: [
          { label: "THE NEW", value: "THE NEW" },
          { label: "THE ITEM", value: null },
          { label: "SPECIAL PRICES", value: "SPECIAL PRICES" }
        ]
      },
      {
        title: "COLLECTION",
        links: [
          { label: "DRESSES", value: "DRESSES" },
          { label: "TOPS | BODIES", value: "TOPS | BODIES" },
          { label: "T-SHIRTS", value: "T-SHIRTS" },
          { label: "SHIRTS", value: "SHIRTS" },
          { label: "TROUSERS", value: "TROUSERS" },
          { label: "SHORTS | BERMUDAS", value: "SHORTS | BERMUDAS" },
          { label: "CARDIGANS | SWEATERS", value: "CARDIGANS | SWEATERS" },
          { label: "CO-ORD SETS", value: "CO-ORD SETS" },
          { label: "JEANS", value: "JEANS" },
          { label: "SKIRTS", value: "SKIRTS" },
          { label: "JACKETS", value: "JACKETS" }
        ]
      }
    ]
  },
  {
    name: "MAN",
    sections: [
      {
        title: "NEW IN",
        links: [
          { label: "THE NEW", value: "THE NEW" },
          { label: "THE ITEM", value: null },
          { label: "SPECIAL PRICES", value: "SPECIAL PRICES" }
        ]
      },
      {
        title: "COLLECTION",
        links: [
          { label: "T-SHIRTS", value: "T-SHIRTS" },
          { label: "SHIRTS", value: "SHIRTS" },
          { label: "TROUSERS", value: "TROUSERS" },
          { label: "SHORTS | BERMUDAS", value: "SHORTS | BERMUDAS" },
          { label: "JACKETS", value: "JACKETS" }
        ]
      }
    ]
  },
  {
    name: "KIDS",
    sections: [
      {
        title: "NEW IN",
        links: [
          { label: "THE NEW", value: "THE NEW" },
          { label: "THE ITEM", value: null },
          { label: "SPECIAL PRICES", value: "SPECIAL PRICES" }
        ]
      },
      {
        title: "COLLECTION",
        links: [
          { label: "T-SHIRTS", value: "T-SHIRTS" },
          { label: "TROUSERS", value: "TROUSERS" }
        ]
      }
    ]
  },
  {
    name: "BEAUTY",
    sections: [
      {
        title: "COLLECTION",
        links: [
          { label: "MAKEUP", value: "MAKEUP" },
          { label: "SKINCARE", value: "SKINCARE" },
          { label: "FRAGRANCE", value: "FRAGRANCE" }
        ]
      }
    ]
  },
  {
    name: "COLLECTION",
    sections: [
      {
        title: "ALL",
        links: [
          { label: "VIEW ALL", value: null }
        ]
      }
    ]
  }
];

const THUMBNAILS = [
  { label: "THE NEW", filter: "THE NEW", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { label: "KNITWEAR", filter: "TOPS | BODIES", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" },
  { label: "DRESSES", filter: "DRESSES", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80" },
  { label: "SPECIAL PRICES", filter: "SPECIAL PRICES", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" },
];

export default function NavigationDrawer() {
  const { isNavOpen, setNavOpen, setIsHelpOpen, setSelectedProduct, setIsQuickViewOpen } = useCart();
  const { setFilter, products } = useProduct();
  const [activeCategory, setActiveCategory] = useState("WOMAN");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const router = useRouter();

  if (!isNavOpen) return null;
  const handleClose = () => {
    setNavOpen(false);
  };

  const handleLoginClick = () => {
    setNavOpen(false);
    router.push("/admin/login");
  };


  const handleSubCategoryClick = (cat: string, subCategory: string | null) => {
    setActiveCategory(cat);
    setFilter(cat, subCategory);
    setNavOpen(false);
    const catalog = document.getElementById("catalog");
    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMainCategoryClick = (cat: { name: string; isLink?: boolean; href?: string }) => {
    if (cat.isLink && cat.href) {
      setNavOpen(false);
      router.push(cat.href);
      return;
    }
    setActiveCategory(cat.name === activeCategory ? "" : cat.name);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.targetTouches[0].clientX - touchStart;
    // Swipe left to close navigation (since it covers full screen, swipe left is intuitive)
    if (diff < -50) {
      handleClose();
      setTouchStart(null);
    }
  };

  const onTouchEnd = () => setTouchStart(null);

  return (
    <div 
      className="fixed inset-0 z-50 bg-heca-bg text-heca-primary flex flex-col transition-all duration-300 font-sans overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start w-full px-6 md:px-10 py-8">
        <div className="flex items-start gap-12">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-heca-primary hover:opacity-60 transition-opacity min-h-[44px] min-w-[44px] p-1 flex items-center justify-center -ml-2"
            aria-label="Close navigation"
          >
            <X size={36} strokeWidth={1} />
          </button>
          
          {/* Brand Logo */}
          <h1 className="text-6xl md:text-8xl font-serif tracking-tighter uppercase leading-none mt-[-10px]">
            HECA
          </h1>
        </div>

        {/* Top Right Utilities */}
        <div className="flex flex-col items-end space-y-4 text-[11px] uppercase tracking-widest font-medium relative">
          <div className="flex items-center border-b border-heca-primary pb-1 w-48 lg:w-64 justify-between">
            <input 
              type="text" 
              placeholder="SEARCH" 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full placeholder:text-heca-primary/70"
            />
          </div>
          
          {/* Live Search Preview Dropdown */}
          {localSearchQuery.trim() !== "" && (
            <div className="absolute top-10 right-0 w-64 max-h-[300px] overflow-y-auto bg-heca-bg border border-heca-primary/20 shadow-xl z-50 flex flex-col">
              {products.filter(p => p.name.toLowerCase().includes(localSearchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center opacity-60">No results found.</div>
              ) : (
                products
                  .filter(p => p.name.toLowerCase().includes(localSearchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map(product => (
                    <button 
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsQuickViewOpen(true);
                        setNavOpen(false);
                        setLocalSearchQuery("");
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-heca-primary/5 transition-colors border-b border-heca-primary/10 last:border-b-0 text-left"
                    >
                      <div className="relative w-10 h-12 flex-shrink-0 bg-heca-primary/10">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col flex-1 truncate">
                        <span className="truncate">{product.name}</span>
                        <span className="opacity-60 mt-1">{product.displayPrice}</span>
                      </div>
                    </button>
                  ))
              )}
            </div>
          )}
          <div className="flex gap-4 mt-2">
            <button onClick={handleLoginClick} className="hover:opacity-60 transition-opacity uppercase tracking-widest cursor-pointer z-30">LOG IN</button>
            <button onClick={() => { setNavOpen(false); setIsHelpOpen(true); }} className="hover:opacity-60 transition-opacity uppercase tracking-widest cursor-pointer z-30">HELP</button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION ACCORDION */}
      <div className="flex-1 flex flex-col px-6 md:px-10 mt-10 md:mt-20 pb-20">
        <div className="flex flex-col space-y-2 md:space-y-4">
          {CATEGORIES.map((category) => (
            <div key={category.name} className="flex flex-col">
              <button
                onClick={() => handleMainCategoryClick(category)}
                className={`text-left text-3xl md:text-5xl font-serif tracking-widest uppercase hover:italic transition-all duration-300 flex items-center gap-4 py-2 ${
                  activeCategory === category.name ? "italic" : ""
                }`}
              >
                {activeCategory === category.name && <span className="text-[12px] md:text-[16px]">•</span>}
                {category.name}
              </button>
              
              {/* ACCORDION CONTENT */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  activeCategory === category.name ? "max-h-[1000px] opacity-100 mt-8 mb-12" : "max-h-0 opacity-0 mt-0 mb-0"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-12 md:gap-24 pl-4 md:pl-12">
                  {category.sections.map((section, sIdx) => (
                    <div key={sIdx} className="flex flex-col gap-6 md:flex-row md:gap-12">
                      <div className="text-heca-primary/50 whitespace-nowrap text-[11px] font-sans tracking-widest uppercase mt-1">
                        | 0{sIdx + 1} | {section.title}
                      </div>
                      <div className="flex flex-col space-y-4 text-[11px] font-sans tracking-widest uppercase items-start">
                        {section.links.map((link, lIdx) => (
                          <button 
                            key={lIdx}
                            onClick={() => handleSubCategoryClick(category.name, link.value)} 
                            className={`hover:underline underline-offset-4 text-left transition-colors ${link.value === "SPECIAL PRICES" ? "text-[#D6001C]" : ""}`}
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* THUMBNAILS (Only show for WOMAN as example) */}
                  {category.name === "WOMAN" && (
                    <div className="hidden lg:flex gap-4 items-start ml-auto">
                      {THUMBNAILS.map((item, idx) => (
                        <div key={idx} onClick={() => handleSubCategoryClick("WOMAN", item.filter)} className="flex flex-col gap-2 cursor-pointer group w-24 xl:w-32">
                          <div className="relative w-full aspect-[2/3] bg-[#e0d9d0] overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.label}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="200px"
                            />
                          </div>
                          <span className="text-[9px] uppercase tracking-widest font-sans opacity-70 group-hover:opacity-100 transition-opacity">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
