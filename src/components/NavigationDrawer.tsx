"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/context/CustomerContext";

const FEATURED_BABY_CATEGORIES = [
  {
    label: "Newborn (0–12 Bulan | 50–70cm)",
    cat: "NEWBORN",
    sub: null,
    badge: "50-70 cm",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80",
  },
  {
    label: "Toddler / Batita (1–4 Tahun | 80–110cm)",
    cat: "TODDLER",
    sub: null,
    badge: "80-110 cm",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
  },
  {
    label: "Bodysuit & Romper Air-Mesh",
    cat: "ALL",
    sub: "BODYSUIT",
    badge: "Terlaris",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
  },
  {
    label: "Piyama & Baju Tidur Kancing",
    cat: "ALL",
    sub: "PIYAMA",
    badge: "Tidur Nyenyak",
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&q=80",
  },
];

export default function NavigationDrawer() {
  const { isNavOpen, setNavOpen, setIsHelpOpen, openQuickView, formatPrice } = useCart();
  const { setFilter, products } = useProduct();
  const { isAuthenticated } = useCustomer();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const router = useRouter();

  const dynamicCategories = useMemo(() => {
    const catsMap = new Map<string, string[]>();
    products.forEach((p) => {
      const c = p.category.toUpperCase();
      const s = p.subCategory.toUpperCase();
      if (!catsMap.has(c)) catsMap.set(c, []);
      if (s && !catsMap.get(c)!.includes(s)) catsMap.get(c)!.push(s);
    });
    return Array.from(catsMap.entries()).map(([name, subs]) => ({
      name,
      subs,
    }));
  }, [products]);

  if (!isNavOpen) return null;

  const handleClose = () => setNavOpen(false);

  const handleAccountClick = () => {
    setNavOpen(false);
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/login");
    }
  };

  const handleSelectFilter = (cat: string, sub: string | null) => {
    setFilter(cat, sub);
    setNavOpen(false);
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={handleClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative z-10 w-full max-w-lg bg-[#FAF7F2] text-[#2C2523] h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-8 shadow-2xl">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#2C2523]/10">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2C2523]">Baby Gemoy</span>
              <span className="bg-[#E05A47] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                HECA
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white border border-[#2C2523]/10 flex items-center justify-center hover:bg-[#2C2523]/5 transition-colors cursor-pointer"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search inside Drawer */}
          <div className="my-5 relative">
            <div className="flex items-center bg-white border border-[#2C2523]/15 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-[#2C2523]/50 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari pakaian bayi, bodysuit, piyama..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-xs text-[#2C2523]"
              />
            </div>

            {localSearchQuery.trim() !== "" && (
              <div className="mt-2 bg-white rounded-2xl border border-[#2C2523]/15 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {products.filter((p) =>
                  p.name.toLowerCase().includes(localSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="p-4 text-xs text-center text-[#2C2523]/50">
                    Produk tidak ditemukan.
                  </div>
                ) : (
                  products
                    .filter((p) =>
                      p.name.toLowerCase().includes(localSearchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          openQuickView(product, 0);
                          setNavOpen(false);
                          setLocalSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#2C2523]/5 last:border-b-0 text-left cursor-pointer"
                      >
                        <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-[#F3EFEA] shrink-0">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#2C2523] truncate">{product.name}</p>
                          <p className="text-[11px] text-[#E05A47] font-medium mt-0.5">{formatPrice(product.price)}</p>
                        </div>
                      </button>
                    ))
                )}
              </div>
            )}
          </div>

          {/* Visual Baby Stage Cards */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2C2523]/50 mb-3">
              KATEGORI USIA & KOLEKSI UTAMA
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {FEATURED_BABY_CATEGORIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectFilter(item.cat, item.sub)}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#2C2523]/10 p-2.5 text-left hover:border-[#E05A47] transition-all cursor-pointer"
                >
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-[#F3EFEA]">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="200px"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#2C2523]/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C2523] leading-snug group-hover:text-[#E05A47] transition-colors">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Categories & Subcategories */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2C2523]/50">
              SEMUA KATEGORI PRODUK
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectFilter("ALL", null)}
                className="px-4 py-2 rounded-full bg-[#2C2523] text-white text-xs font-semibold cursor-pointer"
              >
                Semua Koleksi ({products.length})
              </button>
              <button
                type="button"
                onClick={() => handleSelectFilter("ALL", "THE NEW")}
                className="px-4 py-2 rounded-full bg-white border border-[#2C2523]/15 text-xs font-medium hover:border-[#2C2523] cursor-pointer"
              >
                Koleksi Terbaru
              </button>
              <button
                type="button"
                onClick={() => handleSelectFilter("ALL", "SPECIAL PRICES")}
                className="px-4 py-2 rounded-full bg-[#FDEEE9] text-[#E05A47] text-xs font-semibold cursor-pointer"
              >
                Promo & Diskon
              </button>
            </div>

            {dynamicCategories.map((cat) => (
              <div key={cat.name} className="pt-3 border-t border-[#2C2523]/10">
                <button
                  type="button"
                  onClick={() => handleSelectFilter(cat.name, null)}
                  className="text-sm font-serif font-bold uppercase tracking-wider text-[#2C2523] hover:text-[#E05A47] mb-2 block cursor-pointer"
                >
                  {cat.name}
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSelectFilter(cat.name, sub)}
                      className="px-3 py-1 rounded-full bg-white border border-[#2C2523]/10 text-[11px] text-[#2C2523]/80 hover:border-[#E05A47] hover:text-[#E05A47] transition-colors cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Drawer Footer Links */}
        <div className="pt-6 mt-8 border-t border-[#2C2523]/10 flex items-center justify-between text-xs font-semibold">
          <button
            type="button"
            onClick={handleAccountClick}
            className="px-4 py-2.5 rounded-full bg-white border border-[#2C2523]/15 hover:border-[#2C2523] transition-colors cursor-pointer"
          >
            {isAuthenticated ? "Akun Saya" : "Masuk / Daftar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setNavOpen(false);
              setIsHelpOpen(true);
            }}
            className="px-4 py-2.5 rounded-full bg-[#E9F0EB] text-[#3D6B52] hover:bg-[#dce8df] transition-colors cursor-pointer"
          >
            Bantuan & Panduan Ibu
          </button>
        </div>
      </div>
    </div>
  );
}
