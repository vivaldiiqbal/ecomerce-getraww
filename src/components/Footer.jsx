import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight } from 'lucide-react';


export const Footer = () => {
  const { showToast, toggleDrawer } = useShop();
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      showToast('Terima kasih telah berlangganan info rilis New Drop GETRAW!');
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-black text-white border-t border-neutral-800 pt-12 pb-8 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Top Newsletter & Brand Quote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-12 border-b border-neutral-800">
          <div>
            <img 
              src="/logo-transparent.png" 
              alt="GETRAW Logo" 
              className="h-10 sm:h-14 w-auto object-contain mb-3" 
            />
          </div>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
              Dapatkan Info New Drop & Diskon Rahasia:
            </span>
            <div className="flex max-w-md">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Masukkan email Anda..."
                className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white font-medium"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center space-x-1"
              >
                <span>Langganan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Middle Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs text-neutral-400">

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Layanan Pelanggan</h4>
            <ul className="space-y-1.5 font-medium">
              <li><a href="#catalogSection" className="hover:text-white transition-colors">Cara Belanja Mandiri</a></li>
              <li>
                <button 
                  onClick={() => toggleDrawer('orderTracker', true)}
                  className="hover:text-white transition-colors text-left text-emerald-400 font-bold"
                >
                  ⚡ Lacak Status Pengiriman Pesanan (#THX-...)
                </button>
              </li>
              <li><a href="#catalogSection" className="hover:text-white transition-colors">Panduan Sizing Boxy Fit</a></li>
              <li><a href="#catalogSection" className="hover:text-white transition-colors">Syarat & Ketentuan Pengembalian</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Metode Pembayaran</h4>
            <p className="text-[11px] leading-relaxed">
              Dukungan pembayaran mandiri instan via QRIS Nasional, Mandiri Virtual Account, BCA VA, GoPay, ShopeePay, OVO, & Cash Kiosk.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-white">QRIS</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-white">MANDIRI VA</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-white">BCA VA</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-white">GOPAY</span>
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] font-bold text-white">OVO</span>
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Ikuti Sosial Media</h4>
            <p className="text-[11px]">Dapatkan bocoran rilis artikel terbaru dan lookbook editorial.</p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/getraw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-900 hover:bg-white hover:text-black border border-neutral-700 rounded-none flex items-center justify-center transition-colors text-white"
                title="Instagram GETRAW"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-medium">
          <p>© 2026 GETRAW®. All rights reserved. Self-Service Kiosk Engine.</p>
          <p className="mt-2 sm:mt-0">Designed for Urban High-Fashion & Streetwear Enthusiasts.</p>
        </div>

      </div>
    </footer>
  );
};
