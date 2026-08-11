"use client";

import React, { useEffect, useState } from "react";

export default function SplashScreen() {
  const [stage, setStage] = useState<"initial" | "fade-in" | "expand" | "slide-up" | "done">("initial");

  useEffect(() => {
    // Sequence of animations

    // Sequence of animations
    const sequence = async () => {
      // 1. Brief pause on blank screen
      await new Promise(r => setTimeout(r, 200));
      setStage("fade-in");

      // 2. Expand letter spacing
      await new Promise(r => setTimeout(r, 800));
      setStage("expand");

      // 3. Slide up to reveal
      await new Promise(r => setTimeout(r, 1200));
      setStage("slide-up");

      // 4. Unmount completely
      await new Promise(r => setTimeout(r, 1000));
      setStage("done");
      sessionStorage.setItem("heca_splash_seen", "true");
    };

    sequence();
  }, []);

  if (stage === "done") return null;

  return (
    <div 
      className={`fixed inset-0 z-[999] bg-heca-bg flex items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        stage === "slide-up" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <h1 
        className={`font-serif text-5xl md:text-7xl font-black text-heca-primary uppercase transition-all duration-[1200ms] ease-out ${
          stage === "initial" ? "opacity-0 tracking-normal" :
          stage === "fade-in" ? "opacity-100 tracking-normal" :
          "opacity-100 tracking-[0.4em] md:tracking-[0.6em] ml-[0.4em] md:ml-[0.6em]"
        }`}
      >
        HECA
      </h1>
    </div>
  );
}
