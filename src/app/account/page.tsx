"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CustomerData {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

interface OrderRecord {
  id: string;
  paypal_order_id: string | null;
  product_name: string;
  size: string | null;
  qty: number;
  total: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Profile & Address states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Indonesia");

  // Orders
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login?redirect=/account");
          return;
        }

        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/login?redirect=/account");
          return;
        }

        setUserEmail(data.user.email);
        if (data.customer) {
          setFullName(data.customer.full_name || "");
          setPhone(data.customer.phone || "");
          setAddressLine1(data.customer.address_line1 || "");
          setAddressLine2(data.customer.address_line2 || "");
          setCity(data.customer.city || "");
          setState(data.customer.state || "");
          setPostalCode(data.customer.postal_code || "");
          setCountry(data.customer.country || "Indonesia");
        }
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load customer profile:", err);
        router.replace("/login?redirect=/account");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      showToast("Shipping address & profile updated successfully");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#EBE6DF] text-[#111111] flex items-center justify-center font-sans">
        <p className="text-xs uppercase tracking-widest opacity-60">Loading Client Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#EBE6DF] text-[#111111] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex flex-col space-y-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#111111]/20 pb-6 gap-4">
          <div>
            <Link href="/" className="text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-3 block">
              ← Return to Archive
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif tracking-widest uppercase">My Client Account</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1">
              Signed in as <span className="font-mono font-medium">{userEmail}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-[#111111]/30 px-6 py-2.5 text-[10px] uppercase tracking-widest hover:border-[#111111] hover:bg-[#111111]/5 transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Shipping Address / Profile Form (col-span-5) */}
          <div className="lg:col-span-5 bg-white p-8 border border-[#111111]/10 h-fit">
            <h2 className="text-sm font-serif uppercase tracking-widest mb-6">Shipping & Delivery Details</h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col space-y-5">
              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                  placeholder="Victoria Sterling"
                />
              </div>

              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Phone Number (Courier Contact)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Street Address Line 1</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                  placeholder="Jl. Sudirman No. 100, Tower A"
                />
              </div>

              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                  placeholder="Unit 18B / Suite 200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                    placeholder="Jakarta Selatan"
                  />
                </div>
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                    placeholder="DKI Jakarta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                    placeholder="12190"
                  />
                </div>
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="border-b border-[#111111]/30 py-2 outline-none focus:border-[#111111] bg-transparent text-xs"
                    placeholder="Indonesia"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#111111] text-[#EBE6DF] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#111111]/90 transition-colors mt-4 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Delivery Address"}
              </button>
            </form>
          </div>

          {/* Order History Listing (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <h2 className="text-sm font-serif uppercase tracking-widest">Acquisition History ({orders.length})</h2>

            {orders.length === 0 ? (
              <div className="bg-white p-12 border border-[#111111]/10 text-center flex flex-col items-center justify-center space-y-4">
                <p className="text-xs uppercase tracking-widest opacity-60">
                  No orders recorded under this account.
                </p>
                <Link
                  href="/#catalog"
                  className="px-6 py-2.5 bg-[#111111] text-[#EBE6DF] text-[10px] uppercase tracking-[0.2em] hover:bg-[#111111]/90 transition-colors"
                >
                  Explore The Collection
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 border border-[#111111]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-serif uppercase tracking-wider font-semibold">
                          {order.product_name}
                        </span>
                        {order.size && (
                          <span className="text-[10px] px-2 py-0.5 border border-[#111111]/20 font-mono">
                            {order.size}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
                        Date: {new Date(order.created_at).toLocaleDateString()} · Qty: {order.qty}
                      </div>
                      {order.paypal_order_id && (
                        <div className="text-[9px] uppercase tracking-wider opacity-40 font-mono">
                          ID: {order.paypal_order_id}
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end justify-between w-full md:w-auto gap-2">
                      <span className="text-sm font-serif font-bold">
                        {order.currency} {Number(order.total).toLocaleString()}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2.5 py-0.5 font-bold ${
                          order.status === "COMPLETED" || order.status === "CAPTURED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "FAILED" || order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111111] text-[#EBE6DF] px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 z-50 ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}
