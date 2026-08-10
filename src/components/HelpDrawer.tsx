"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function HelpDrawer() {
  const { isHelpOpen, setIsHelpOpen } = useCart();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!isHelpOpen) return null;

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  const faqs = [
    {
      id: "shipping",
      title: "SHIPPING & DELIVERY",
      content: "All orders are processed within 1-2 business days. Standard shipping typically takes 2-4 business days for domestic orders. You will receive a tracking link once your order has been dispatched."
    },
    {
      id: "returns",
      title: "RETURNS & REFUNDS",
      content: "We accept returns within 7 days of the delivery date. Items must be unworn, unwashed, and in original condition with tags attached. Refunds will be processed back to the original payment method."
    },
    {
      id: "size",
      title: "SIZE GUIDE",
      content: "Our sizes follow standard international sizing. For a precise fit, please refer to the specific measurements provided on each product page or contact our Client Care team for personalized sizing advice."
    },
    {
      id: "orders",
      title: "ORDER STATUS",
      content: "You can track your order directly through the marketplace platform (Shopee/Tokopedia/TikTok) where you made the purchase, using the tracking number provided in your transaction details."
    }
  ];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.targetTouches[0].clientX - touchStart;
    // Swipe right to close
    if (diff > 50) {
      setIsHelpOpen(false);
      setTouchStart(null);
    }
  };

  const onTouchEnd = () => setTouchStart(null);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300"
        onClick={() => setIsHelpOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-[90vw] md:w-[450px] bg-heca-bg text-heca-primary z-[70] flex flex-col font-sans transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: isHelpOpen ? 'translateX(0)' : 'translateX(100%)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:px-10 border-b border-heca-primary/20">
          <h2 className="text-sm font-serif uppercase tracking-widest">Help / Client Care</h2>
          <button 
            onClick={() => setIsHelpOpen(false)}
            className="hover:opacity-60 transition-opacity p-2 -mr-2"
            aria-label="Close Help Drawer"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <p className="text-xs uppercase tracking-widest opacity-70 leading-loose mb-12">
            Find answers to common questions below. If you need further assistance, our Client Care team is available directly via WhatsApp or email.
          </p>

          <div className="flex flex-col mb-12">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-heca-primary/20">
                <button 
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex justify-between items-center py-6 text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-xs uppercase tracking-widest font-medium">{faq.title}</span>
                  {openAccordion === faq.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === faq.id ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-xs tracking-wider leading-loose opacity-70 text-justify">
                    {faq.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 border border-heca-primary/10 flex flex-col space-y-6">
            <h3 className="text-sm font-serif uppercase tracking-widest text-center">Contact Us</h3>
            <a 
              href="https://wa.me/6280000000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-4 text-center text-xs uppercase tracking-[0.2em] hover:bg-[#20b858] transition-colors"
            >
              Chat via WhatsApp
            </a>
            <a 
              href="mailto:clientcare@heca.com" 
              className="w-full bg-heca-primary text-heca-bg py-4 text-center text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              Email Client Care
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
