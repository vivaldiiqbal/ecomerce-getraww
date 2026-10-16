import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, ChevronRight, Tag, MapPin, Truck } from 'lucide-react';

export const MobileNavDrawer = () => {
  const { drawers, toggleDrawer, setFilters, resetAllFilters } = useShop();

  if (!drawers.mobileMenu) return null;

  const handleSelectNav = (cat) => {
    if (cat === 'all') {
      resetAllFilters();
    } else if (cat === 'discount') {
      setFilters(prev => ({ ...prev, productType: 'discount', searchQuery: '' }));
    } else {
      setFilters(prev => ({ ...prev, categories: [cat], productType: 'all', searchQuery: '' }));
    }
    toggleDrawer('mobileMenu', false);
    document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div
        onClick={() => toggleDrawer('mobileMenu', false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      <aside className="fixed top-0 left-0 h-full w-full max-w-xs bg-white z-50 shadow-2xl transition-transform flex flex-col justify-between animate-slide-right">
        
        <div>
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black text-white">
            <img 
              src="/logo-transparent.png" 
              alt="GETRAW Logo" 
              className="h-7 w-auto object-contain" 
            />
            <button
              onClick={() => toggleDrawer('mobileMenu', false)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-5 space-y-1 font-bold text-xs uppercase tracking-wider text-neutral-900">
            <button
              onClick={() => handleSelectNav('all')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between hover:pl-2 transition-all"
            >
              <span>Semua Produk (All)</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleSelectNav('Tees')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between hover:pl-2 transition-all"
            >
              <span>Graphic Tees</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleSelectNav('Shirts')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between hover:pl-2 transition-all"
            >
              <span>Shirts & Oversized</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleSelectNav('Outerwear')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between hover:pl-2 transition-all"
            >
              <span>Hoodies & Outerwear</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleSelectNav('Pants')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between hover:pl-2 transition-all"
            >
              <span>Cargo Pants & Shorts</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            <button
              onClick={() => handleSelectNav('discount')}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between text-red-600 hover:pl-2 transition-all"
            >
              <span className="flex items-center space-x-1.5">
                <Tag className="w-4 h-4" />
                <span>Special Discount 50%</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                toggleDrawer('mobileMenu', false);
                toggleDrawer('orderTracker', true);
              }}
              className="w-full text-left py-3 border-b border-neutral-100 flex items-center justify-between text-neutral-900 hover:pl-2 transition-all font-bold"
            >
              <span className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Lacak Status Pesanan</span>
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 space-y-2">
          <p className="flex items-center space-x-1 font-bold text-black">
            <MapPin className="w-3.5 h-3.5" />
            <span>Store BSD City & Kemang</span>
          </p>
          <p className="text-[11px] text-neutral-500">
            Jam Buka Store: 10:00 - 22:00 WIB Setiap Hari
          </p>
        </div>

      </aside>
    </>
  );
};
