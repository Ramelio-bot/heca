"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";

export default function HelpDrawer() {
  const { isHelpOpen, setIsHelpOpen } = useCart();
  const { storeLinks } = useProduct();
  const [openAccordion, setOpenAccordion] = useState<string | null>("size");

  if (!isHelpOpen) return null;

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const faqs = [
    {
      id: "size",
      title: "CARA MEMILIH UKURAN BAYI (50 CM – 110 CM)",
      content:
        "Ukuran pakaian HECA Baby mengacu pada tinggi badan si kecil dalam sentimeter: 50cm (Newborn 0-2 bulan, ±3kg), 60cm (3-5 bulan, ±6kg), 70cm (6-11 bulan, ±9kg), 80cm (12-18 bulan, ±11kg), 90cm (2 tahun, ±13kg), 100cm (3 tahun, ±16kg), dan 110cm (4 tahun, ±19kg). Jika ragu di antara dua ukuran, pilih 1 ukuran lebih besar.",
    },
    {
      id: "fabric",
      title: "KEAMANAN BAHAN & LABEL DI LUAR (ANTI-GATAL)",
      content:
        "Seluruh produk HECA Baby menggunakan 100% katun organik bersertifikat Oeko-Tex® Standard 100 yang bebas zat kimia berbahaya. Khusus ukuran Newborn & Baby (50-80cm), label pakaian dijahit di bagian luar agar tidak menggesek kulit sensitif bayi.",
    },
    {
      id: "shipping",
      title: "PENGIRIMAN & GARANSI TUKAR UKURAN",
      content:
        "Pesanan diproses dalam 1x24 jam kerja. Kami menyediakan garansi tukar ukuran (size exchange) dalam 7 hari setelah barang diterima selama pakaian belum dicuci dan tag masih terpasang.",
    },
    {
      id: "care",
      title: "CARA MENCUCI PAKAIAN KATUN ORGANIK BAYI",
      content:
        "Disarankan mencuci dengan air suhu normal atau hangat (maks 40°C) menggunakan deterjen khusus bayi yang lembut. Jangan gunakan pemutih klorin agar serat katun tetap lembut dan awet.",
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity"
        onClick={() => setIsHelpOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-[#FAF7F2] text-[#2C2523] z-[70] flex flex-col font-sans shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#2C2523]/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E05A47] block">
              BABY GEMOY HECA CARE
            </span>
            <h2 className="text-lg font-serif font-bold text-[#2C2523]">
              Pusat Bantuan & Panduan Ibu
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="w-9 h-9 rounded-full bg-white border border-[#2C2523]/10 flex items-center justify-center hover:bg-[#2C2523]/5 transition-colors cursor-pointer"
            aria-label="Tutup Bantuan"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-xs text-[#2C2523]/75 leading-relaxed">
            Temukan jawaban seputar panduan ukuran tinggi badan bayi, keamanan bahan katun organik, serta layanan konsultasi ukuran gratis bersama tim HECA Baby.
          </p>

          <div className="space-y-2.5">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#2C2523]/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#2C2523] pr-3">
                    {faq.title}
                  </span>
                  {openAccordion === faq.id ? (
                    <ChevronUp size={16} className="shrink-0 text-[#E05A47]" />
                  ) : (
                    <ChevronDown size={16} className="shrink-0 text-[#2C2523]/50" />
                  )}
                </button>
                {openAccordion === faq.id && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#2C2523]/75 leading-relaxed border-t border-[#2C2523]/5">
                    {faq.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#2C2523]/10 flex flex-col space-y-3">
            <h3 className="text-sm font-serif font-bold text-center text-[#2C2523]">
              Butuh Konsultasi Ukuran Si Kecil?
            </h3>
            <p className="text-xs text-center text-[#2C2523]/65">
              Beritahu usia, berat (kg), dan tinggi (cm) si kecil kepada tim kami:
            </p>
            <a
              href={storeLinks?.clientService || "mailto:care@heca.com"}
              target={storeLinks?.clientService?.startsWith("http") ? "_blank" : undefined}
              rel={storeLinks?.clientService?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3.5 rounded-full text-center text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Chat WhatsApp / Layanan Ibu
            </a>
            <a
              href="mailto:care@heca.com"
              className="w-full bg-[#2C2523] hover:bg-[#2C2523]/90 text-white py-3.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider transition-opacity"
            >
              Email: care@heca.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
