"use client";

import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Product } from "@/context/ProductContext";

interface PaypalCheckoutProps {
  product: Product;
  selectedSize: string;
  onClose: () => void;
}

export default function PaypalCheckout({ product, selectedSize, onClose }: PaypalCheckoutProps) {
  const [config, setConfig] = useState<{ clientId: string; currency: string; mode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ orderId: string; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load PayPal config:", err);
        setErrorMessage("Unable to connect to PayPal gateway.");
        setLoading(false);
      });
  }, []);

  const rawPrice = Number(product.price);
  const discount = Number(product.discountPercent || 0);
  const unitPrice = discount > 0 ? rawPrice * (1 - discount / 100) : rawPrice;
  const shipping = 15;
  const total = unitPrice + shipping;

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize || "M",
          qty: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.paypalOrderId) {
        throw new Error(data.error || "Failed to create order");
      }
      return data.paypalOrderId;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment");
      setIsProcessing(false);
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.status !== "COMPLETED") {
        throw new Error(result.error || "Payment capture unsuccessful");
      }

      setSuccessOrder({
        orderId: result.orderId,
        total: result.total,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Error capturing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#EBE6DF] text-[#111111] max-w-md w-full p-8 shadow-2xl relative border border-[#111111]/10">
        <button
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close PayPal Checkout"
          className="absolute top-6 right-6 p-2 text-sm uppercase tracking-widest opacity-60 hover:opacity-100 disabled:opacity-30"
        >
          ✕
        </button>

        {successOrder ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-4 border border-[#111111] flex items-center justify-center">
              ✓
            </div>
            <h2 className="font-serif text-2xl uppercase tracking-widest mb-2">Order Confirmed</h2>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-6">
              Thank you for shopping with HECA.
            </p>
            <div className="border-t border-b border-[#111111]/20 py-4 mb-6 text-left space-y-2 text-xs uppercase tracking-wider">
              <div className="flex justify-between">
                <span className="opacity-60">Order Reference</span>
                <span className="font-mono text-[10px]">{successOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Item</span>
                <span>{product.name} ({selectedSize})</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span>${successOrder.total.toFixed(2)} USD</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#111111] text-[#EBE6DF] py-3 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Continue Exploring
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-xl uppercase tracking-widest mb-6">Direct Checkout</h2>

            {/* Order Summary */}
            <div className="space-y-3 mb-6 pb-6 border-b border-[#111111]/15 text-xs uppercase tracking-wider">
              <div className="flex justify-between">
                <span className="opacity-70">{product.name} ({selectedSize})</span>
                <span>${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Worldwide Express Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#111111]/10 text-sm">
                <span>Total</span>
                <span>${total.toFixed(2)} USD</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 bg-[#D6001C]/10 border border-[#D6001C]/30 text-[#D6001C] text-xs uppercase tracking-wider">
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="py-8 text-center text-xs uppercase tracking-widest opacity-50">
                Initializing Secure Gateway...
              </div>
            ) : config?.clientId ? (
              <div className="relative min-h-[140px]">
                {isProcessing && (
                  <div className="absolute inset-0 bg-[#EBE6DF]/80 z-20 flex items-center justify-center text-xs uppercase tracking-widest">
                    Processing Payment...
                  </div>
                )}
                <PayPalScriptProvider
                  options={{
                    clientId: config.clientId,
                    currency: "USD",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", color: "black", label: "pay" }}
                    disabled={isProcessing}
                    createOrder={handleCreateOrder}
                    onApprove={handleApprove}
                    onError={(err) => {
                      console.error("PayPal button error:", err);
                      setErrorMessage("PayPal checkout error. Please verify credentials or sandbox mode.");
                      setIsProcessing(false);
                    }}
                    onCancel={() => {
                      setIsProcessing(false);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="p-6 border border-[#111111]/20 bg-[#111111]/5 text-center space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold">
                  Pembayaran Online Sedang Disiapkan
                </p>
                <p className="opacity-70 text-[11px] leading-relaxed">
                  Silakan belanja via Shopee / Tokopedia / TikTok untuk sementara waktu.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={product.shopeeUrl || "https://shopee.co.id/heca.official"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-[#111111]/30 text-[9px] uppercase tracking-widest hover:border-[#111111]"
                  >
                    Shopee
                  </a>
                  <a
                    href={product.tokopediaUrl || "https://tokopedia.com/hecaofficial"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-[#111111]/30 text-[9px] uppercase tracking-widest hover:border-[#111111]"
                  >
                    Tokopedia
                  </a>
                  <a
                    href={product.tiktokUrl || "https://tiktok.com/@heca.official"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-[#111111]/30 text-[9px] uppercase tracking-widest hover:border-[#111111]"
                  >
                    TikTok
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
