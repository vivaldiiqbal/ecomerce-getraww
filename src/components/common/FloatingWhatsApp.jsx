import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const faqList = [
    "Halo Admin, saya ingin menanyakan ketersediaan stok t-shirt.",
    "Bagaimana cara klaim kupon DISKON 50%?",
    "Saya butuh bantuan untuk sizing chart hoodie boxy fit.",
    "Bisa bantu verifikasi pembayaran QRIS saya?"
  ];

  const handleSendFaq = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/6281289341029?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick FAQ Dialog */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-neutral-300 shadow-2xl p-4 space-y-3 font-sans text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2 bg-black text-white p-2.5 -m-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold uppercase tracking-wider text-[11px]">CS GETRAW® WA</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-neutral-600 leading-relaxed text-[11px]">
            Halo! Ada yang bisa kami bantu seputar produk streetwear atau belanja mandiri hari ini?
          </p>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Bantuan Cepat:</span>
            {faqList.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendFaq(faq)}
                className="w-full text-left p-2 bg-neutral-50 hover:bg-black hover:text-white transition-colors border border-neutral-200 text-[11px] font-medium flex items-center justify-between group"
              >
                <span className="line-clamp-1">{faq}</span>
                <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <a
              href="https://wa.me/6281289341029?text=Halo%20Admin%20GETRAW,%20saya%20butuh%20bantuan."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 text-white py-2 text-center font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1.5 text-[11px]"
            >
              <span>Chat Langsung di WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Rounded Black Box Floating Button with White WhatsApp Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center shadow-2xl hover:scale-105 transition-all group relative border border-neutral-800"
        title="Hubungi Admin WhatsApp"
        aria-label="WhatsApp Support"
      >
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.974.551 1.936.879 2.801.88h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.778-5.766zm3.391 8.237c-.144.405-.837.774-1.17.824-.312.045-.715.067-2.331-.595-1.937-.795-3.18-2.776-3.275-2.906-.096-.13-1.026-1.365-1.026-2.604 0-1.238.647-1.849.877-2.099.23-.25.501-.313.668-.313.167 0 .334.002.48.01.157.008.366-.06.573.438.214.515.731 1.782.794 1.912.063.13.104.282.021.447-.083.165-.125.269-.25.414-.125.146-.263.326-.376.438-.125.125-.255.261-.11.51.146.25.647 1.066 1.388 1.726.953.849 1.756 1.112 2.006 1.237.25.125.397.104.543-.063.146-.167.626-.73.793-.98.167-.25.334-.209.563-.125.23.084 1.458.688 1.708.813.25.125.417.188.48.292.062.104.062.604-.082 1.009z"/>
        </svg>

        {!isOpen && (
          <span className="absolute right-14 bg-black text-white text-[11px] font-semibold py-1 px-2.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-neutral-700">
            Chat CS Belanja Mandiri
          </span>
        )}
      </button>
    </div>
  );
};
