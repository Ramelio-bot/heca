"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AntiGravityHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setNavOpen, setIsHelpOpen } = useCart();
  const { heroSlides, searchQuery, setSearchQuery } = useProduct();
  const router = useRouter();
  
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);

  const handleLoginClick = () => {
    setNavOpen(false);
    router.push("/admin/login");
  };

  const handleNext = () => {
    if (heroSlides.length === 0) return;
    setCurrentIndex((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (heroSlides.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  // Auto-play horizontal carousel every 4.5s
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);


  return (
    <div className="relative w-full h-screen bg-[#EBE6DF] overflow-hidden">
      
      {/* Horizontal Slider with Parallax */}
      <motion.div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, y }}
      >
        {heroSlides.length === 0 && (
          <div className="w-full h-full bg-[#EBE6DF]"></div>
        )}
        {heroSlides.map((slide, index) => (
          <div key={slide.id} className="relative w-full h-full flex-shrink-0">
            {slide.type === "video" ? (
              <video 
                src={slide.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-top md:object-[center_15%]"
              />
            ) : (
              <Image
                src={slide.url}
                alt={`Heca Editorial ${index + 1}`}
                fill
                priority={index === currentIndex || index === 0}
                className="object-cover object-top md:object-[center_15%]"
                sizes="100vw"
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Massive Brand Logo Overlay */}
      <div className="absolute bottom-[-2vh] md:bottom-[-4vh] right-4 md:right-8 z-20 pointer-events-none mix-blend-difference opacity-90">
        <h1 className="font-serif text-[18vw] md:text-[15vw] font-black leading-none tracking-tighter text-[#EBE6DF] uppercase">
          HECA
        </h1>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute bottom-6 left-6 z-30 p-4 text-heca-bg mix-blend-difference hover:opacity-60 transition-opacity"
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button 
        onClick={handleNext}
        className="absolute bottom-6 right-6 md:right-[5vw] z-30 p-4 text-heca-bg mix-blend-difference hover:opacity-60 transition-opacity"
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Header Overlay ala Zara */}
      <nav className="fixed top-0 left-0 w-full px-6 md:px-10 py-8 z-40 flex justify-between items-start text-heca-bg mix-blend-difference pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          {/* Thin Hamburger Menu Icon */}
          <div className="w-11 h-11 flex flex-col justify-center gap-1.5 cursor-pointer group -ml-2" onClick={() => setNavOpen(true)}>
            <div className="w-8 h-px bg-current transition-transform group-hover:scale-110 origin-left"></div>
            <div className="w-8 h-px bg-current transition-transform group-hover:scale-110 origin-left"></div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-3 text-[10px] uppercase tracking-widest font-sans font-medium pointer-events-auto">
          <div className="border-b border-current pb-1 w-48 mb-4">
            <input 
              type="text" 
              placeholder="SEARCH" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0) {
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-transparent outline-none w-full placeholder:text-current placeholder:uppercase"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleLoginClick} className="hover:opacity-60 transition-opacity uppercase tracking-widest z-30 cursor-pointer min-h-[44px] min-w-[44px] px-2 flex items-center justify-center">LOG IN</button>
            <button onClick={() => setIsHelpOpen(true)} className="hover:opacity-60 transition-opacity min-h-[44px] min-w-[44px] px-2 flex items-center justify-center -mr-2">HELP</button>
          </div>
        </div>
      </nav>
      
      {/* Slide Indicators (Dots/Pills) */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 mix-blend-difference">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-[#EBE6DF] ${
              currentIndex === idx 
                ? "w-8 opacity-100" 
                : "w-1.5 opacity-40 hover:opacity-80 hover:w-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
