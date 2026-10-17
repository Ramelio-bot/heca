"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EBE6DF] text-[#111111] flex flex-col items-center justify-center font-sans px-6 py-12 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity"
      >
        ← Back to Store
      </Link>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-widest uppercase mb-2">HECA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Client Login</p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-6">
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              placeholder="client@domain.com"
              required
              className="w-full bg-transparent border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] transition-colors text-xs tracking-wider placeholder:text-[#111111]/30"
            />
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              placeholder="••••••••"
              required
              className={`w-full bg-transparent border-b ${
                errorMsg ? "border-[#D6001C]" : "border-[#111111]/30"
              } py-2 outline-none focus:border-[#111111] transition-colors text-xs tracking-widest placeholder:text-[#111111]/30`}
            />
            {errorMsg && (
              <p className="text-[10px] text-[#D6001C] tracking-widest uppercase mt-1">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] text-[#EBE6DF] py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#111111]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="flex flex-col space-y-3 pt-4 border-t border-[#111111]/10 w-full text-[10px] uppercase tracking-widest">
          <p className="opacity-60">Do not have an account yet?</p>
          <Link
            href={`/register${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="underline underline-offset-4 hover:opacity-60 transition-opacity font-medium"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EBE6DF]" />}>
      <LoginForm />
    </Suspense>
  );
}
