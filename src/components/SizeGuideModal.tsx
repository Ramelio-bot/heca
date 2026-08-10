import React from "react";
import Image from "next/image";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
}

export default function SizeGuideModal({ isOpen, onClose, imageUrl }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-heca-bg text-heca-primary w-full max-w-2xl mx-4 p-8 md:p-12 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-2xl font-light hover:opacity-60 transition-opacity z-10"
          aria-label="Close Size Guide"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-serif tracking-widest uppercase mb-2">Size Guide</h2>
          {!imageUrl && <p className="text-xs uppercase tracking-widest opacity-60">Measurements in cm</p>}
        </div>

        {imageUrl ? (
          <div className="relative w-full h-[60vh]">
            <Image src={imageUrl} alt="Size Guide" fill className="object-contain" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase tracking-widest">
              <thead>
                <tr className="border-b border-heca-primary/20">
                  <th className="py-4 font-normal opacity-60">Size</th>
                  <th className="py-4 font-normal opacity-60">Chest</th>
                  <th className="py-4 font-normal opacity-60">Waist</th>
                  <th className="py-4 font-normal opacity-60">Hips</th>
                  <th className="py-4 font-normal opacity-60">Length</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-heca-primary/10 hover:bg-heca-primary/5 transition-colors">
                  <td className="py-4 font-bold">S</td>
                  <td className="py-4">84 - 88</td>
                  <td className="py-4">64 - 68</td>
                  <td className="py-4">90 - 94</td>
                  <td className="py-4">110</td>
                </tr>
                <tr className="border-b border-heca-primary/10 hover:bg-heca-primary/5 transition-colors">
                  <td className="py-4 font-bold">M</td>
                  <td className="py-4">89 - 93</td>
                  <td className="py-4">69 - 73</td>
                  <td className="py-4">95 - 99</td>
                  <td className="py-4">112</td>
                </tr>
                <tr className="border-b border-heca-primary/10 hover:bg-heca-primary/5 transition-colors">
                <td className="py-4 font-bold">L</td>
                <td className="py-4">94 - 98</td>
                <td className="py-4">74 - 78</td>
                <td className="py-4">100 - 104</td>
                <td className="py-4">114</td>
              </tr>
              <tr className="border-b border-heca-primary/10 hover:bg-heca-primary/5 transition-colors">
                <td className="py-4 font-bold">XL</td>
                <td className="py-4">99 - 103</td>
                <td className="py-4">79 - 83</td>
                <td className="py-4">105 - 109</td>
                <td className="py-4">116</td>
              </tr>
            </tbody>
          </table>
        </div>
        )}

        <div className="mt-8 text-[10px] uppercase tracking-widest opacity-60 leading-relaxed text-center">
          <p>Please note that measurements may vary slightly depending on the style and fabric of the garment. If you are between sizes, we recommend sizing up for a more relaxed fit.</p>
        </div>
      </div>
    </div>
  );
}
