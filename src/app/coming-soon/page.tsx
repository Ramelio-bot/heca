import React from "react";
import Link from "next/link";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export default async function ComingSoonPage() {
  const settings = await getSiteSettings();
  const comingSoon = settings.coming_soon || DEFAULT_SITE_SETTINGS.coming_soon!;

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-heca-primary flex flex-col items-center justify-center font-sans px-6 text-center">
      <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase mb-6">
        {comingSoon.title}
      </h1>
      <p className="text-sm md:text-base opacity-60 tracking-widest uppercase mb-12 max-w-md mx-auto leading-relaxed">
        {comingSoon.text}
      </p>
      
      <Link 
        href="/"
        className="text-[10px] uppercase tracking-widest font-bold border-b border-heca-primary pb-1 hover:opacity-60 transition-opacity"
      >
        Return to Archive
      </Link>
    </div>
  );
}
