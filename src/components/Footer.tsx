"use client";

import React from "react";
import Link from "next/link";
import { useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { HomeContentSetting, FooterSetting } from "@/lib/siteSettings";

interface FooterProps {
  homeContent?: HomeContentSetting;
  footerSettings?: FooterSetting;
}

export default function Footer({ homeContent, footerSettings }: FooterProps) {
  const { storeLinks, setFilter } = useProduct();
  const { setIsHelpOpen } = useCart();

  const handleCategoryClick = (e: React.MouseEvent, category: string, sub: string | null = null) => {
    e.preventDefault();
    setFilter(category, sub);
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHelpOpen(true);
  };

  return (
    <footer className="w-full bg-[#F3EFEA] text-[#2C2523] pt-16 pb-10 px-4 sm:px-6 lg:px-10 font-sans border-t border-[#2C2523]/10">
      <div className="max-w-[1440px] mx-auto flex flex-col space-y-14">
        
        {/* Top Section: Brand Promise & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#2C2523]/8">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif text-2xl font-bold text-[#2C2523]">Baby Gemoy</span>
              <span className="bg-[#E05A47] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                HECA
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2C2523] mb-2">
              {homeContent?.newsletter_title || "Komunitas Ibu & Tumbuh Kembang Si Kecil"}
            </h3>
            <p className="text-xs text-[#2C2523]/70 leading-relaxed">
              {homeContent?.newsletter_text ||
                "Dapatkan panduan memilih ukuran pakaian bayi sesuai tinggi badan (50cm–110cm), tips mencuci pakaian katun organik, serta promo eksklusif bulanan."}
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 min-w-[280px] sm:min-w-[380px]">
            <input
              type="email"
              placeholder="Masukkan alamat email Ibu/Ayah..."
              className="flex-1 bg-[#FAF7F2] border border-[#2C2523]/15 rounded-full px-5 py-3 text-xs outline-none focus:border-[#E05A47] transition-colors"
            />
            <button
              type="button"
              className="bg-[#2C2523] hover:bg-[#E05A47] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
            >
              Berlangganan
            </button>
          </div>
        </div>

        {/* Middle Section: Links Grid (Responsive 2 cols on HP, 4 cols on TAB & DESKTOP) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="flex flex-col space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#E05A47] mb-1">
              Kategori Usia & Produk
            </h4>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "NEWBORN", null)} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Newborn (0–12 Bulan | 50–70cm)
            </a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "TODDLER", null)} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Toddler / Batita (1–4 Tahun | 80–110cm)
            </a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "ALL", "BODYSUIT")} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Bodysuit & Romper Air-Mesh
            </a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "ALL", "PIYAMA")} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Piyama Kancing Pengait
            </a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "ALL", "LEGGING")} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Celana Legging & Bawahan
            </a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "BABY CARE", null)} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Baby Care & Aksesoris
            </a>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5E8C71] mb-1">
              Panduan & Layanan Ibu
            </h4>
            <a href="#" onClick={handleHelpClick} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Panduan Ukuran Bayi (50–110 cm)
            </a>
            <a href="#" onClick={handleHelpClick} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Standar Katun Organik Oeko-Tex®
            </a>
            <a href="#" onClick={handleHelpClick} className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Info Pengiriman & Penukaran Size
            </a>
            <a href={storeLinks.clientService || "#"} onClick={!storeLinks.clientService ? handleHelpClick : undefined} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Konsultasi Ukuran via WhatsApp
            </a>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#3B6E8C] mb-1">
              Official Marketplace
            </h4>
            <a href={storeLinks.shopee || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Shopee Official Store
            </a>
            <a href={storeLinks.tokopedia || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Tokopedia Official Store
            </a>
            <a href={storeLinks.tiktok || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              TikTok Shop HECA Baby
            </a>
            <Link href="/coming-soon" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Lokasi Toko & Pop-Up
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C6527] mb-1">
              Ikuti HECA Baby
            </h4>
            <a href={storeLinks.instagram || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Instagram
            </a>
            <a href={storeLinks.tiktok || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              TikTok
            </a>
            <a href={storeLinks.pinterest || "#"} target="_blank" rel="noopener noreferrer" className="text-[#2C2523]/75 hover:text-[#2C2523] transition-colors">
              Pinterest Lookbook
            </a>
            <Link href="/admin" className="text-[#2C2523]/40 hover:text-[#2C2523] transition-colors pt-2">
              Admin Portal
            </Link>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#2C2523]/10 text-[11px] text-[#2C2523]/55">
          <p>{footerSettings?.copyright || `© ${new Date().getFullYear()} HECA BABY & KIDS. HAK CIPTA DILINDUNGI.`}</p>
          <div className="flex space-x-6">
            <a href="#" onClick={handleHelpClick} className="hover:text-[#2C2523] transition-colors">Kebijakan Privasi</a>
            <a href="#" onClick={handleHelpClick} className="hover:text-[#2C2523] transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
