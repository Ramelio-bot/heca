import React from "react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#EBE6DF] text-heca-primary flex flex-col items-center justify-center font-sans px-6 text-center">
      <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase mb-6">
        Coming Soon
      </h1>
      <p className="text-sm md:text-base opacity-60 tracking-widest uppercase mb-12 max-w-md mx-auto leading-relaxed">
        We are currently curating this experience. Please check back later for updates.
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
