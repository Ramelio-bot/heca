"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@heca.com");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        try {
          await supabase.auth.setSession({ access_token: data.token, refresh_token: "" });
        } catch {}
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EBE6DF] text-[#111111] flex flex-col items-center justify-center font-sans px-4">
      <Link href="/" className="absolute top-8 left-8 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity">
        ← Back to Store
      </Link>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-widest uppercase mb-2">HECA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-6">
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
              placeholder="admin@heca.com"
              required
              className="w-full bg-transparent border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] transition-colors text-sm tracking-wider placeholder:text-[#111111]/30"
            />
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              placeholder="••••••••"
              required
              className={`w-full bg-transparent border-b ${errorMsg ? 'border-[#D6001C]' : 'border-[#111111]/30'} py-2 outline-none focus:border-[#111111] transition-colors text-sm tracking-widest placeholder:text-[#111111]/30`}
            />
            {errorMsg && (
              <p className="text-[10px] text-[#D6001C] tracking-widest uppercase mt-1">
                {errorMsg}
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] text-[#EBE6DF] py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#111111]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
