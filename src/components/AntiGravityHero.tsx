"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/context/CustomerContext";
import SizeGuideModal from "./SizeGuideModal";

const QUICK_NAV_ITEMS = [
  { label: "Semua Koleksi", category: "ALL", subCategory: null },
  { label: "Newborn (0–12B)", category: "NEWBORN", subCategory: null },
  { label: "Toddler (1–4T)", category: "TODDLER", subCategory: null },
  { label: "Bodysuit & Romper", category: "ALL", subCategory: "BODYSUIT" },
  { label: "Piyama & Tidur", category: "ALL", subCategory: "PIYAMA" },
  { label: "Legging & Bawahan", category: "ALL", subCategory: "LEGGING" },
  { label: "Baby Care", category: "BABY CARE", subCategory: null },
  { label: "Promo Spesial", category: "ALL", subCategory: "SPECIAL PRICES" },
];

const BABY_STAGES = [
  {
    id: "newborn",
    stage: "TAHAP 1 • 0–6 BULAN",
    title: "Newborn",
    sizeBadge: "50 – 60 cm (3–6 kg)",
    desc: "Bukaan depan kimono & jahitan rata dengan label di bagian luar agar tidak menggores kulit bayi baru lahir.",
    bg: "bg-[#EBF3F7]",
    accent: "text-[#3B6E8C]",
    badgeBg: "bg-[#3B6E8C] text-white",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    filterCat: "NEWBORN",
    filterSub: null,
  },
  {
    id: "crawler",
    stage: "TAHAP 2 • 6–18 BULAN",
    title: "Baby & Crawler",
    sizeBadge: "70 – 80 cm (7–11 kg)",
    desc: "Bodysuit Air-Cotton Mesh ekstra sejuk & kancing snap hipoalergenik untuk si kecil yang aktif merangkak.",
    bg: "bg-[#E9F0EB]",
    accent: "text-[#3D6B52]",
    badgeBg: "bg-[#3D6B52] text-white",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
    filterCat: "ALL",
    filterSub: "BODYSUIT",
  },
  {
    id: "toddler",
    stage: "TAHAP 3 • 1–4 TAHUN",
    title: "Toddler / Batita",
    sizeBadge: "80 – 110 cm (11–19 kg)",
    desc: "Piyama dengan kancing pengait pinggang anti-merosot & celana legging super lentur untuk bebas berlari.",
    bg: "bg-[#FDF6E4]",
    accent: "text-[#8C6527]",
    badgeBg: "bg-[#8C6527] text-white",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
    filterCat: "TODDLER",
    filterSub: null,
  },
  {
    id: "care",
    stage: "ESENSIAL • 0–4 TAHUN",
    title: "Baby Care & Essentials",
    sizeBadge: "All Size • Hypoallergenic",
    desc: "Selimut bedong muslin organik, celemek makan (bib), kaus kaki anti-slip, dan perlengkapan harian lembut.",
    bg: "bg-[#FDEEE9]",
    accent: "text-[#B8432E]",
    badgeBg: "bg-[#E05A47] text-white",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
    filterCat: "BABY CARE",
    filterSub: null,
  },
];

export default function AntiGravityHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { setNavOpen, setIsHelpOpen, currency, setCurrency } = useCart();
  const { heroSlides, searchQuery, setSearchQuery, activeCategory, activeSubCategory, setFilter } = useProduct();
  const { isAuthenticated } = useCustomer();
  const router = useRouter();

  const handleAccountClick = () => {
    setNavOpen(false);
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/login");
    }
  };

  const handleNext = () => {
    if (heroSlides.length === 0) return;
    setCurrentIndex((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (heroSlides.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleNavFilter = (cat: string, sub: string | null) => {
    setFilter(cat, sub);
    const el = document.getElementById("catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* STICKY HEADER NAVIGATION (Compatible with HP, TAB, DESKTOP) */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#2C2523]/10 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 md:h-20 flex items-center justify-between gap-3">
          
          {/* Left: Menu + Brand Logo */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Buka menu navigasi"
              className="w-10 h-10 rounded-full hover:bg-[#2C2523]/5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-5 h-0.5 bg-[#2C2523] rounded-full"></span>
              <span className="w-5 h-0.5 bg-[#2C2523] rounded-full"></span>
              <span className="w-3.5 h-0.5 bg-[#2C2523] rounded-full self-start ml-2.5"></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilter("ALL", null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2523]">
                Baby Gemoy
              </span>
              <span className="bg-[#E05A47] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
                HECA
              </span>
            </button>
          </div>

          {/* Center: Desktop Quick Age/Category Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {QUICK_NAV_ITEMS.slice(0, 7).map((item, idx) => {
              const isActive =
                activeCategory.toUpperCase() === item.category &&
                (activeSubCategory || null) === item.subCategory;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleNavFilter(item.category, item.subCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#2C2523] text-[#FAF7F2] shadow-xs"
                      : "text-[#2C2523]/75 hover:text-[#2C2523] hover:bg-[#2C2523]/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Search, Size Guide, Currency, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop & Tablet Search Input */}
            <div className="hidden md:flex items-center bg-white border border-[#2C2523]/15 focus-within:border-[#E05A47] rounded-full px-3.5 py-1.5 w-48 lg:w-64 transition-colors shadow-2xs">
              <svg className="w-3.5 h-3.5 text-[#2C2523]/50 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari bodysuit, piyama..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-transparent outline-none w-full text-xs text-[#2C2523] placeholder:text-[#2C2523]/45"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#2C2523]/40 hover:text-[#2C2523] ml-1"
                >
                  ×
                </button>
              )}
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Cari produk"
              className="md:hidden w-9 h-9 rounded-full bg-white border border-[#2C2523]/15 flex items-center justify-center text-[#2C2523]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Quick Size Guide Button */}
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E9F0EB] text-[#3D6B52] hover:bg-[#dce8df] text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>📏</span>
              <span>Ukuran (cm)</span>
            </button>

            {/* Currency Toggle Pill */}
            <div className="flex items-center bg-[#F3EFEA] border border-[#2C2523]/10 rounded-full p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setCurrency("IDR")}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  currency === "IDR" ? "bg-[#2C2523] text-white" : "text-[#2C2523]/60 hover:text-[#2C2523]"
                }`}
              >
                IDR
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  currency === "USD" ? "bg-[#2C2523] text-white" : "text-[#2C2523]/60 hover:text-[#2C2523]"
                }`}
              >
                USD
              </button>
            </div>

            {/* Account & Help */}
            <button
              type="button"
              onClick={handleAccountClick}
              className="px-3 py-1.5 rounded-full border border-[#2C2523]/15 hover:border-[#2C2523] text-[11px] font-medium text-[#2C2523] transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAuthenticated ? "Akun" : "Masuk"}
            </button>

            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hidden lg:inline-flex px-3 py-1.5 rounded-full text-[11px] font-medium text-[#2C2523]/70 hover:text-[#2C2523] transition-colors cursor-pointer"
            >
              Bantuan
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 bg-[#FAF7F2] border-t border-[#2C2523]/5">
            <div className="flex items-center bg-white border border-[#2C2523]/20 rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-[#2C2523]/50 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Cari bodysuit, piyama, legging bayi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-transparent outline-none w-full text-xs text-[#2C2523]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-[#2C2523]/50 px-1"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile & Tablet Horizontal Quick Filter Bar (HP & TAB Friendly) */}
        <div className="xl:hidden flex items-center overflow-x-auto gap-2 px-4 sm:px-6 py-2.5 bg-[#FAF7F2] border-t border-[#2C2523]/5 scrollbar-hide">
          {QUICK_NAV_ITEMS.map((item, idx) => {
            const isActive =
              activeCategory.toUpperCase() === item.category &&
              (activeSubCategory || null) === item.subCategory;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleNavFilter(item.category, item.subCategory)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[#E05A47] text-white font-semibold shadow-2xs"
                    : "bg-white border border-[#2C2523]/10 text-[#2C2523]/80 hover:border-[#2C2523]/30"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="sm:hidden px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#E9F0EB] text-[#3D6B52] shrink-0"
          >
            Panduan Ukuran (cm)
          </button>
        </div>
      </header>

      {/* HERO BANNER SECTION (Responsive for HP, TAB, DESKTOP) */}
      <section className="w-full bg-[#FAF7F2] pt-4 pb-10 md:py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative w-full min-h-[460px] sm:min-h-[520px] lg:h-[72vh] max-h-[760px] rounded-3xl overflow-hidden bg-[#EFEAE2] shadow-sm border border-[#2C2523]/5">
            
            {/* Slides */}
            <div
              className="absolute inset-0 flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="relative w-full h-full flex-shrink-0">
                  {slide.type === "video" ? (
                    <video
                      src={slide.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <Image
                      src={slide.url}
                      alt={`HECA Baby Collection ${index + 1}`}
                      fill
                      priority={index === 0}
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 1440px"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Warm Readable Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C2523]/85 via-[#2C2523]/35 to-transparent md:bg-gradient-to-r md:from-[#2C2523]/80 md:via-[#2C2523]/40 md:to-transparent z-10" />

            {/* Hero Content Box */}
            <div className="relative z-20 h-full min-h-[460px] sm:min-h-[520px] lg:h-[72vh] max-h-[760px] flex flex-col justify-end md:justify-center p-6 sm:p-10 md:p-14 lg:p-20 max-w-2xl text-[#FAF7F2]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-[#E05A47] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  KOLEKSI BAYI & BATITA
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full">
                  50 CM – 110 CM (0–4 TAHUN)
                </span>
                <span className="bg-[#5E8C71]/90 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full">
                  100% ORGANIC COTTON
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight mb-4">
                Lembut & Aman Untuk Kulit Sensitif Si Kecil.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-[#FAF7F2]/90 leading-relaxed mb-6 md:mb-8 max-w-xl">
                Dirancang dengan standar kenyamanan ekstra: bahan katun organik & Air-Mesh penyejuk kulit, kancing snap anti-alergi, serta jahitan label di bagian luar agar bayi bebas iritasi.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#E05A47] hover:bg-[#c94b39] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Lihat Koleksi Bayi
                </button>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="bg-white/90 hover:bg-white text-[#2C2523] font-semibold text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-6 py-3.5 rounded-full shadow-md backdrop-blur-sm transition-all cursor-pointer"
                >
                  Panduan Ukuran (cm)
                </button>
              </div>
            </div>

            {/* Slider Controls */}
            {heroSlides.length > 1 && (
              <>
                <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Slide sebelumnya"
                    className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#2C2523] flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Slide berikutnya"
                    className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#2C2523] flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Slide Indicator Pills */}
                <div className="absolute top-5 right-6 md:top-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-30 flex items-center gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx ? "w-8 bg-[#E05A47]" : "w-2 bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* UNIQLO BABY INSPIRED: SHOP BY AGE & HEIGHT STAGE (50cm - 110cm) */}
      <section className="w-full bg-[#FAF7F2] py-8 md:py-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E05A47] block mb-1">
                PANDUAN USIA & TINGGI BADAN
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2523]">
                Pilih Sesuai Tahap Tumbuh Kembang
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="self-start md:self-auto text-xs font-semibold uppercase tracking-wider text-[#2C2523] border-b border-[#2C2523] pb-1 hover:text-[#E05A47] hover:border-[#E05A47] transition-colors cursor-pointer"
            >
              Lihat Tabel Ukuran Lengkap (50cm – 110cm) →
            </button>
          </div>

          {/* 4-Column Responsive Stage Cards (1 col HP, 2 col TAB, 4 col DESKTOP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {BABY_STAGES.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNavFilter(item.filterCat, item.filterSub)}
                className={`${item.bg} rounded-2xl p-5 flex flex-col justify-between border border-[#2C2523]/5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.accent}`}>
                      {item.stage}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.badgeBg}`}>
                      {item.sizeBadge}
                    </span>
                  </div>

                  <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-4 bg-white/50">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#2C2523] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#2C2523]/75 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2C2523]/10 text-xs font-semibold text-[#2C2523] group-hover:text-[#E05A47] transition-colors">
                  <span>Lihat Koleksi {item.title}</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </>
  );
}
