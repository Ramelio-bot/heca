"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HECA Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-heca-bg text-heca-primary flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono">
          System Exception {error.digest ? `· ${error.digest}` : ""}
        </span>
        
        <h1 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tight">
          An Unexpected Interrupt
        </h1>

        <div className="w-8 h-px bg-heca-primary/20 my-2" />

        <p className="text-xs uppercase tracking-widest opacity-60 leading-relaxed max-w-sm">
          We encountered an issue while curating your luxury experience. Please attempt to reset the session or return to the main gallery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="px-8 py-3.5 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-heca-primary/90 transition-all cursor-pointer"
          >
            Retry Session
          </button>
          <Link
            href="/"
            className="px-8 py-3.5 border border-heca-primary/30 text-heca-primary text-[10px] uppercase tracking-[0.25em] font-bold hover:border-heca-primary transition-all text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
