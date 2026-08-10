"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPasscode = localStorage.getItem("heca_admin_passcode") || "admin123";
    if (password === currentPasscode) {
      const sessionData = {
        auth: true,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
      };
      sessionStorage.setItem("heca_admin", JSON.stringify(sessionData));
      router.push("/admin");
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-heca-bg text-heca-primary flex flex-col items-center justify-center font-sans px-4">
      
      <Link href="/" className="absolute top-8 left-8 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity">
        ← BACK TO STORE
      </Link>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-widest uppercase mb-2">HECA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-6">
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Passcode</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter admin passcode"
              className={`w-full bg-transparent border-b ${error ? 'border-[#D6001C]' : 'border-heca-primary/30'} py-2 outline-none focus:border-heca-primary transition-colors text-sm tracking-widest placeholder:text-heca-primary/30`}
            />
            {error && <p className="text-[10px] text-[#D6001C] tracking-widest uppercase mt-1">Invalid Passcode</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-heca-primary text-heca-bg py-4 text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90 transition-colors"
          >
            Access Portal
          </button>
        </form>
      </div>
    </div>
  );
}
