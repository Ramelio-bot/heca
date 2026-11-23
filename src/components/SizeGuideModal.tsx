"use client";

import React, { useState } from "react";
import Image from "next/image";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
}

const NEWBORN_SIZES = [
  { size: "50 cm (NB)", age: "0 – 2 Bulan", height: "45 – 55 cm", weight: "± 3 kg", note: "Bukaan depan kimono, jahitan luar" },
  { size: "60 cm", age: "3 – 5 Bulan", height: "55 – 65 cm", weight: "± 6 kg", note: "Bodysuit & Romper kancing snap" },
  { size: "70 cm", age: "6 – 11 Bulan", height: "65 – 75 cm", weight: "± 9 kg", note: "Mulai merangkak, Air-Mesh sejuk" },
  { size: "80 cm", age: "12 – 18 Bulan", height: "75 – 85 cm", weight: "± 11 kg", note: "Transisi jalan, legging & bodysuit" },
];

const TODDLER_SIZES = [
  { size: "80 cm", age: "12 – 18 Bulan (±1 Thn)", height: "75 – 85 cm", weight: "± 11 kg", chest: "45 – 51 cm", waist: "42 – 48 cm" },
  { size: "90 cm", age: "18 – 24 Bulan (±2 Thn)", height: "85 – 95 cm", weight: "± 13 kg", chest: "47 – 53 cm", waist: "44 – 50 cm" },
  { size: "100 cm", age: "2 – 3 Tahun", height: "95 – 105 cm", weight: "± 16 kg", chest: "49 – 55 cm", waist: "45 – 51 cm" },
  { size: "110 cm", age: "3 – 4 Tahun", height: "105 – 115 cm", weight: "± 19 kg", chest: "53 – 59 cm", waist: "47 – 53 cm" },
];

export default function SizeGuideModal({ isOpen, onClose, imageUrl }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"newborn" | "toddler">("newborn");
  const [selectedWeightIdx, setSelectedWeightIdx] = useState<number>(1);

  if (!isOpen) return null;

  const QUICK_FINDER = [
    { label: "3 – 4.5 kg (Baru Lahir)", rec: "50 cm (Newborn)", desc: "Pilih 50 cm untuk pas di badan, atau 60 cm agar bisa dipakai hingga usia 4 bulan." },
    { label: "5 – 6.5 kg (3–5 Bulan)", rec: "60 cm", desc: "Ukuran ideal untuk bayi yang mulai aktif menggerakkan tangan dan kaki." },
    { label: "7 – 9.5 kg (6–11 Bulan)", rec: "70 cm", desc: "Cocok untuk fase duduk dan merangkak dengan ruang popok yang lega." },
    { label: "10 – 11.5 kg (1–1.5 Tahun)", rec: "80 cm", desc: "Pas untuk fase belajar berjalan. Piyama dilengkapi pengait pinggang." },
    { label: "12 – 14 kg (2 Tahun)", rec: "90 cm", desc: "Potongan rileks yang nyaman untuk batita yang aktif berlari." },
    { label: "15 – 19 kg (3–4 Tahun)", rec: "100 cm – 110 cm", desc: "Pilih 100 cm untuk tinggi ±100 cm, atau 110 cm untuk pemakaian lebih panjang." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#FAF7F2] text-[#2C2523] w-full max-w-3xl rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl max-h-[92vh] overflow-y-auto border border-[#2C2523]/10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white border border-[#2C2523]/10 flex items-center justify-center text-lg hover:bg-[#2C2523]/5 transition-colors z-10 cursor-pointer"
          aria-label="Tutup Panduan Ukuran"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <span className="inline-block bg-[#E9F0EB] text-[#3D6B52] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            STANDAR UKURAN TINGGI & BERAT BAYI
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#2C2523]">
            Panduan Ukuran Baby Gemoy HECA
          </h2>
          <p className="text-xs text-[#2C2523]/70 mt-1">
            Ukuran pakaian bayi menggunakan patokan <strong>Tinggi Badan (cm)</strong> dari ujung kepala hingga kaki.
          </p>
        </div>

        {imageUrl ? (
          <div className="relative w-full h-[55vh] rounded-2xl overflow-hidden bg-white">
            <Image src={imageUrl} alt="Size Guide" fill className="object-contain" />
          </div>
        ) : (
          <>
            {/* Quick Baby Weight / Height Recommender */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#2C2523]/10 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#E05A47] mb-2.5">
                Cek Rekomendasi Cepat Berdasarkan Berat & Usia Si Kecil:
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_FINDER.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWeightIdx(idx)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      selectedWeightIdx === idx
                        ? "bg-[#2C2523] text-white font-semibold"
                        : "bg-[#FAF7F2] text-[#2C2523]/80 hover:bg-[#2C2523]/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="bg-[#FDF6E4] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C6527] font-bold block">
                    UKURAN YANG DISARANKAN:
                  </span>
                  <span className="text-lg font-serif font-bold text-[#2C2523]">
                    Size {QUICK_FINDER[selectedWeightIdx].rec}
                  </span>
                </div>
                <p className="text-xs text-[#2C2523]/80 sm:max-w-md">
                  {QUICK_FINDER[selectedWeightIdx].desc}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5 bg-[#F3EFEA] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab("newborn")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "newborn"
                    ? "bg-white text-[#2C2523] shadow-xs"
                    : "text-[#2C2523]/60 hover:text-[#2C2523]"
                }`}
              >
                Newborn & Baby (50 – 80 cm)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("toddler")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "toddler"
                    ? "bg-white text-[#2C2523] shadow-xs"
                    : "text-[#2C2523]/60 hover:text-[#2C2523]"
                }`}
              >
                Toddler / Batita (80 – 110 cm)
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-[#2C2523]/10">
              {activeTab === "newborn" ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2C2523]/10 bg-[#FAF7F2] text-[10px] uppercase tracking-wider text-[#2C2523]/60">
                      <th className="py-3.5 px-4 font-bold">Ukuran</th>
                      <th className="py-3.5 px-4 font-bold">Estimasi Usia</th>
                      <th className="py-3.5 px-4 font-bold">Tinggi Badan</th>
                      <th className="py-3.5 px-4 font-bold">Berat Badan</th>
                      <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Fitur Desain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NEWBORN_SIZES.map((row, i) => (
                      <tr key={i} className="border-b border-[#2C2523]/5 last:border-b-0 hover:bg-[#FAF7F2]/60">
                        <td className="py-3.5 px-4 font-bold text-[#E05A47] whitespace-nowrap">{row.size}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.age}</td>
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">{row.height}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.weight}</td>
                        <td className="py-3.5 px-4 text-[#2C2523]/70 hidden sm:table-cell">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2C2523]/10 bg-[#FAF7F2] text-[10px] uppercase tracking-wider text-[#2C2523]/60">
                      <th className="py-3.5 px-4 font-bold">Ukuran</th>
                      <th className="py-3.5 px-4 font-bold">Estimasi Usia</th>
                      <th className="py-3.5 px-4 font-bold">Tinggi Badan</th>
                      <th className="py-3.5 px-4 font-bold">Berat Badan</th>
                      <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Lingkar Dada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TODDLER_SIZES.map((row, i) => (
                      <tr key={i} className="border-b border-[#2C2523]/5 last:border-b-0 hover:bg-[#FAF7F2]/60">
                        <td className="py-3.5 px-4 font-bold text-[#E05A47] whitespace-nowrap">{row.size}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.age}</td>
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">{row.height}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.weight}</td>
                        <td className="py-3.5 px-4 text-[#2C2523]/70 hidden sm:table-cell">{row.chest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Helpful Parent Note */}
        <div className="mt-6 bg-[#E9F0EB] text-[#3D6B52] rounded-2xl p-4 text-xs leading-relaxed">
          <strong>Tips Untuk Ibu & Ayah:</strong> Pertumbuhan bayi di tahun pertama sangat pesat. Jika tinggi atau berat si kecil berada di antara dua ukuran, kami menyarankan memilih <strong>1 ukuran di atasnya</strong> agar pakaian tetap nyaman dan bisa dipakai lebih lama.
        </div>
      </div>
    </div>
  );
}
