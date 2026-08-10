"use client";

import React from "react";
import Link from "next/link";
import { useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";

export default function Footer() {
  const { storeLinks, setFilter } = useProduct();
  const { setIsHelpOpen } = useCart();

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    setFilter(category, null);
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHelpOpen(true);
  };

  return (
    <footer className="w-full bg-[#EBE6DF] text-heca-primary pt-24 pb-12 px-6 md:px-12 font-sans selection:bg-heca-primary selection:text-[#EBE6DF]">
      <div className="max-w-7xl mx-auto flex flex-col space-y-24">
        
        {/* Top Section: Newsletter & Tagline */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-md w-full">
            <h3 className="text-sm font-medium uppercase tracking-widest mb-6">Join The Archive</h3>
            <p className="text-xs opacity-60 mb-8 leading-relaxed">
              Subscribe to receive updates on new arrivals, special offers and other discount information.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                className="w-full bg-transparent border-b border-heca-primary/30 py-3 text-xs uppercase tracking-widest outline-none focus:border-heca-primary transition-colors placeholder:opacity-40"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
          
          <div className="text-left md:text-right hidden md:block">
            <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tighter uppercase opacity-10">
              HECA
            </h1>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[10px] uppercase tracking-widest font-medium">
          <div className="flex flex-col space-y-4">
            <h4 className="opacity-40 mb-2 font-bold">Shop</h4>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "WOMAN")} className="hover:opacity-60 transition-opacity">Woman</a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "MAN")} className="hover:opacity-60 transition-opacity">Man</a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "KIDS")} className="hover:opacity-60 transition-opacity">Kids</a>
            <a href="#catalog" onClick={(e) => handleCategoryClick(e, "BEAUTY")} className="hover:opacity-60 transition-opacity">Beauty</a>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="opacity-40 mb-2 font-bold">Help</h4>
            <a href={storeLinks.clientService || "#"} onClick={!storeLinks.clientService ? handleHelpClick : undefined} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">Client Service</a>
            <a href="#" onClick={handleHelpClick} className="hover:opacity-60 transition-opacity">Shipping & Delivery</a>
            <a href="#" onClick={handleHelpClick} className="hover:opacity-60 transition-opacity">Returns</a>
            <a href="#" onClick={handleHelpClick} className="hover:opacity-60 transition-opacity">Size Guide</a>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="opacity-40 mb-2 font-bold">Company</h4>
            <Link href="/coming-soon" className="hover:opacity-60 transition-opacity">About Us</Link>
            <Link href="/coming-soon" className="hover:opacity-60 transition-opacity">Offices</Link>
            <Link href="/coming-soon" className="hover:opacity-60 transition-opacity">Stores</Link>
            <Link href="/coming-soon" className="hover:opacity-60 transition-opacity">Careers</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="opacity-40 mb-2 font-bold">Social</h4>
            <a href={storeLinks.instagram || "#"} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">Instagram</a>
            <a href={storeLinks.tiktok || "#"} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">TikTok</a>
            <a href={storeLinks.pinterest || "#"} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">Pinterest</a>
            <a href={storeLinks.spotify || "#"} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">Spotify</a>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-heca-primary/10 text-[9px] uppercase tracking-widest opacity-40">
          <p>© 2026 HECA. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
