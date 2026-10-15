"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HECA Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#EBE6DF] text-[#111111] flex flex-col items-center justify-center p-6 text-center select-none font-sans antialiased">
        <div className="max-w-md w-full flex flex-col items-center space-y-6">
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono">
            Critical Exception {error.digest ? `· ${error.digest}` : ""}
          </span>
          
          <h1 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tight">
            HECA
          </h1>

          <div className="w-8 h-px bg-[#111111]/20 my-2" />

          <p className="text-xs uppercase tracking-widest opacity-60 leading-relaxed max-w-sm">
            A critical system interrupt occurred. We apologize for the inconvenience.
          </p>

          <button
            onClick={() => reset()}
            className="px-8 py-3.5 bg-[#111111] text-[#EBE6DF] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#111111]/90 transition-all cursor-pointer mt-4"
          >
            Reload Interface
          </button>
        </div>
      </body>
    </html>
  );
}
