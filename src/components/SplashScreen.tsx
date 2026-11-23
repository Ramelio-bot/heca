"use client";

import React, { useEffect, useState } from "react";

export default function SplashScreen() {
  const [stage, setStage] = useState<"initial" | "fade-in" | "expand" | "slide-up" | "done">("initial");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("heca_baby_splash_seen")) {
      setStage("done");
      return;
    }

    const sequence = async () => {
      await new Promise(r => setTimeout(r, 150));
      setStage("fade-in");
      await new Promise(r => setTimeout(r, 650));
      setStage("expand");
      await new Promise(r => setTimeout(r, 900));
      setStage("slide-up");
      await new Promise(r => setTimeout(r, 800));
      setStage("done");
      localStorage.setItem("heca_baby_splash_seen", "true");
    };

    sequence();
  }, []);

  if (stage === "done") return null;

  return (
    <div 
      className={`fixed inset-0 z-[999] bg-[#FAF7F2] flex flex-col items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        stage === "slide-up" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <h1 
          className={`font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-[#2C2523] transition-all duration-1000 ease-out ${
            stage === "initial" ? "opacity-0 scale-95" :
            stage === "fade-in" ? "opacity-100 scale-100" :
            "opacity-100 tracking-[0.08em]"
          }`}
        >
          Baby Gemoy
        </h1>
        <span
          className={`bg-[#E05A47] text-white text-xs md:text-base font-bold uppercase tracking-widest px-3.5 py-1 rounded-full transition-all duration-700 ${
            stage === "initial" ? "opacity-0 scale-75" : "opacity-100 scale-100"
          }`}
        >
          HECA
        </span>
      </div>
      <p
        className={`mt-4 text-xs uppercase tracking-[0.25em] text-[#2C2523]/60 transition-opacity duration-700 ${
          stage === "initial" ? "opacity-0" : "opacity-100"
        }`}
      >
        Organic Cotton & Gentle Baby Essentials
      </p>
    </div>
  );
}
