import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Ruler } from 'lucide-react';

export const SizeGuideModal = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full p-6 shadow-2xl relative border border-neutral-200 animate-fade-in">
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4 border-b border-neutral-200 pb-3">
          <Ruler className="w-5 h-5 text-black" />
          <h3 className="text-sm font-black uppercase tracking-wider">Panduan Ukuran (Streetwear Size Chart)</h3>
        </div>

        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
          Produk apparel GETRAW® menggunakan potong <strong className="text-black">Oversized Boxy Fit</strong>. Toleransi perbedaan ukuran berkisar 1 - 2 cm karena proses produksi masal.
        </p>

        {/* Size Table T-shirt & Hoodie */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">T-Shirt & Hoodie (In Centimeters):</h4>
          <div className="overflow-x-auto border border-neutral-200 text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-neutral-100 text-black font-bold uppercase border-b border-neutral-200">
                <tr>
                  <th className="p-2 border-r border-neutral-200">Size</th>
                  <th className="p-2 border-r border-neutral-200">Lebar Dada</th>
                  <th className="p-2 border-r border-neutral-200">Panjang Badan</th>
                  <th className="p-2">Panjang Lengan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">S</td>
                  <td className="p-2 border-r border-neutral-200">52 cm</td>
                  <td className="p-2 border-r border-neutral-200">70 cm</td>
                  <td className="p-2">22 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">M</td>
                  <td className="p-2 border-r border-neutral-200">55 cm</td>
                  <td className="p-2 border-r border-neutral-200">73 cm</td>
                  <td className="p-2">23 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">L</td>
                  <td className="p-2 border-r border-neutral-200">58 cm</td>
                  <td className="p-2 border-r border-neutral-200">76 cm</td>
                  <td className="p-2">24 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">XL</td>
                  <td className="p-2 border-r border-neutral-200">62 cm</td>
                  <td className="p-2 border-r border-neutral-200">78 cm</td>
                  <td className="p-2">25 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Size Table Pants */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Pants / Cargo (In Inches):</h4>
          <div className="overflow-x-auto border border-neutral-200 text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-neutral-100 text-black font-bold uppercase border-b border-neutral-200">
                <tr>
                  <th className="p-2 border-r border-neutral-200">Waist Size</th>
                  <th className="p-2 border-r border-neutral-200">Lingkar Pinggang</th>
                  <th className="p-2">Panjang Celana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">30</td>
                  <td className="p-2 border-r border-neutral-200">80 cm</td>
                  <td className="p-2">102 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">32</td>
                  <td className="p-2 border-r border-neutral-200">85 cm</td>
                  <td className="p-2">104 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">34</td>
                  <td className="p-2 border-r border-neutral-200">90 cm</td>
                  <td className="p-2">106 cm</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-neutral-50 border-r border-neutral-200">36</td>
                  <td className="p-2 border-r border-neutral-200">95 cm</td>
                  <td className="p-2">108 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-200 text-right">
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
