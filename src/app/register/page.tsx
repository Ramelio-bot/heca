"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
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
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Create Your Client Account</p>
        </div>

        <form onSubmit={handleRegister} className="w-full flex flex-col space-y-5">
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrorMsg("");
              }}
              placeholder="e.g. Victoria Sterling"
              required
              className="w-full bg-transparent border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] transition-colors text-xs tracking-wider placeholder:text-[#111111]/30"
            />
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Phone Number (For Delivery)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMsg("");
              }}
              placeholder="+62 812 3456 7890"
              className="w-full bg-transparent border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] transition-colors text-xs tracking-wider placeholder:text-[#111111]/30"
            />
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Email Address *</label>
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
            <label className="text-[10px] uppercase tracking-widest opacity-60">Password (Min 8 Characters) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full bg-transparent border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] transition-colors text-xs tracking-widest placeholder:text-[#111111]/30"
            />
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMsg("");
              }}
              placeholder="••••••••"
              required
              minLength={8}
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
            className="w-full bg-[#111111] text-[#EBE6DF] py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#111111]/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <div className="flex flex-col space-y-3 pt-4 border-t border-[#111111]/10 w-full text-[10px] uppercase tracking-widest">
          <p className="opacity-60">Already have a client account?</p>
          <Link
            href={`/login${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="underline underline-offset-4 hover:opacity-60 transition-opacity font-medium"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EBE6DF]" />}>
      <RegisterForm />
    </Suspense>
  );
}
