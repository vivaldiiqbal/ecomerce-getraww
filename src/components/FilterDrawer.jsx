import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, SlidersHorizontal, ChevronUp, ChevronDown, RotateCcw, Check } from 'lucide-react';

export const FilterDrawer = () => {
  const { drawers, toggleDrawer, filters, setFilters, resetAllFilters, showToast } = useShop();

  const [openSections, setOpenSections] = useState({
    categories: true,
    productType: true,
    availability: true,
    price: true,
    size: true
  });

  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // 1. Body Scroll Lock when drawer is open
  useEffect(() => {
    if (drawers.filter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawers.filter]);

  // 2. Keyboard Event Listener (Escape Key to Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawers.filter) {
        toggleDrawer('filter', false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawers.filter, toggleDrawer]);

  if (!drawers.filter) return null;

  const toggleAccordion = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const initialCategories = ['Tees', 'Shirts', 'Outerwear', 'Sweaters', 'Pants'];
  const extraCategories = ['Accessories', 'Headwear'];
  const displayedCategories = showMoreCategories
    ? [...initialCategories, ...extraCategories]
    : initialCategories;

  const allSizes = ['S', 'M', 'L', 'XL', '8', '30', '32', '34', '36'];

  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const exists = prev.categories?.includes(category);
      let updated;
      if (exists) {
        updated = prev.categories.filter(c => c !== category);
      } else {
        updated = [...(prev.categories || []), category];
      }
      return { ...prev, categories: updated };
    });
  };

  const handleSizeClick = (size) => {
    setFilters(prev => ({
      ...prev,
      selectedSize: prev.selectedSize === size ? null : size
    }));
  };

  const handleApplyFilter = () => {
    toggleDrawer('filter', false);
    showToast('Filter berhasil diterapkan!');
    document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Dark Overlay Backdrop with Blur */}
      <div
        onClick={() => toggleDrawer('filter', false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      {/* Slide-Over Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform flex flex-col justify-between animate-slide-left border-l border-neutral-200">
        
        {/* Header Drawer Hitam */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black text-white select-none">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-display">FILTER STREETWEAR</h3>
              <p className="text-[10px] text-neutral-400 font-medium">Saring Katalog Produk Menurut Kategori & Ukuran</p>
            </div>
          </div>
          <button
            onClick={() => toggleDrawer('filter', false)}
            aria-label="Tutup Filter"
            className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (Kartu Shadow Box) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-neutral-800">
          
          {/* Kartu 1: CATEGORIES */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200">
            <div
              className="flex items-center justify-between cursor-pointer py-0.5 select-none"
              onClick={() => toggleAccordion('categories')}
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 font-display">
                Categories
              </span>
              {openSections.categories ? (
                <ChevronUp className="w-4 h-4 text-neutral-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-700" />
              )}
            </div>

            {openSections.categories && (
              <div className="mt-3 space-y-2.5 text-xs text-neutral-800 pt-2 border-t border-gray-100">
                {displayedCategories.map(cat => (
                  <label key={cat} className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-4 h-4 rounded border-gray-300 text-black accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                    />
                    <span>{cat}</span>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  className="text-[11px] text-neutral-500 hover:text-black font-bold flex items-center space-x-1 pt-1 underline"
                >
                  <span>{showMoreCategories ? 'See Less' : 'See More'}</span>
                  {showMoreCategories ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          {/* Kartu 2: PRODUCT TYPE */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200">
            <div
              className="flex items-center justify-between cursor-pointer py-0.5 select-none"
              onClick={() => toggleAccordion('productType')}
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 font-display">
                Product Type
              </span>
              {openSections.productType ? (
                <ChevronUp className="w-4 h-4 text-neutral-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-700" />
              )}
            </div>

            {openSections.productType && (
              <div className="mt-3 space-y-2.5 text-xs text-neutral-800 pt-2 border-t border-gray-100">
                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                  <input
                    type="radio"
                    name="drawerProductType"
                    value="all"
                    checked={filters.productType === 'all'}
                    onChange={() => setFilters(prev => ({ ...prev, productType: 'all' }))}
                    className="w-4 h-4 border-gray-300 accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                  />
                  <span>All Products</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                  <input
                    type="radio"
                    name="drawerProductType"
                    value="discount"
                    checked={filters.productType === 'discount'}
                    onChange={() => setFilters(prev => ({ ...prev, productType: 'discount' }))}
                    className="w-4 h-4 border-gray-300 accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                  />
                  <span className="flex items-center space-x-1.5">
                    <span>Discount 50%</span>
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-xs">SALE</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Kartu 3: AVAILABILITY */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200">
            <div
              className="flex items-center justify-between cursor-pointer py-0.5 select-none"
              onClick={() => toggleAccordion('availability')}
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 font-display">
                Availability
              </span>
              {openSections.availability ? (
                <ChevronUp className="w-4 h-4 text-neutral-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-700" />
              )}
            </div>

            {openSections.availability && (
              <div className="mt-3 space-y-2.5 text-xs text-neutral-800 pt-2 border-t border-gray-100">
                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                  <input
                    type="radio"
                    name="drawerAvailability"
                    value="all"
                    checked={filters.availability === 'all'}
                    onChange={() => setFilters(prev => ({ ...prev, availability: 'all' }))}
                    className="w-4 h-4 border-gray-300 accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                  />
                  <span>All Items</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                  <input
                    type="radio"
                    name="drawerAvailability"
                    value="in-stock"
                    checked={filters.availability === 'in-stock'}
                    onChange={() => setFilters(prev => ({ ...prev, availability: 'in-stock' }))}
                    className="w-4 h-4 border-gray-300 accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            )}
          </div>

          {/* Kartu 4: PRICE RANGE */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200">
            <div
              className="flex items-center justify-between cursor-pointer py-0.5 select-none"
              onClick={() => toggleAccordion('price')}
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 font-display">
                Price Range
              </span>
              {openSections.price ? (
                <ChevronUp className="w-4 h-4 text-neutral-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-700" />
              )}
            </div>

            {openSections.price && (
              <div className="mt-3 space-y-2.5 text-xs text-neutral-800 pt-2 border-t border-gray-100">
                {[
                  { label: 'Semua Harga', value: 'all' },
                  { label: 'Under Rp 230,000', value: 'under-230k' },
                  { label: 'Rp 230,000 - 420,000', value: '230k-420k' },
                  { label: 'Rp 420,000 - 610,000', value: '420k-610k' },
                  { label: 'Rp 610,000 +', value: 'above-610k' }
                ].map(pr => (
                  <label key={pr.value} className="flex items-center space-x-2.5 cursor-pointer hover:text-black font-medium transition-colors">
                    <input
                      type="radio"
                      name="drawerPriceRange"
                      value={pr.value}
                      checked={filters.priceRange === pr.value}
                      onChange={() => setFilters(prev => ({ ...prev, priceRange: pr.value }))}
                      className="w-4 h-4 border-gray-300 accent-black cursor-pointer hover:ring-2 hover:ring-black focus:ring-offset-2 transition-all"
                    />
                    <span>{pr.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Kartu 5: SIZE GRID */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200">
            <div
              className="flex items-center justify-between cursor-pointer py-0.5 select-none"
              onClick={() => toggleAccordion('size')}
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 font-display">
                Size
              </span>
              {openSections.size ? (
                <ChevronUp className="w-4 h-4 text-neutral-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-700" />
              )}
            </div>

            {openSections.size && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {allSizes.map(sz => {
                    const isSelected = filters.selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeClick(sz)}
                        className={`h-9 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-md'
                            : 'border-gray-200 text-neutral-800 shadow-xs hover:shadow-md hover:border-black active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {filters.selectedSize && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedSize: null }))}
                    className="mt-2.5 text-[11px] text-neutral-500 hover:text-black underline block font-semibold"
                  >
                    Reset Ukuran ({filters.selectedSize})
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Sticky Action Footer di Bawah Drawer */}
        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 flex gap-3 z-10 shadow-lg">
          <button
            type="button"
            onClick={resetAllFilters}
            className="flex-1 py-3 border border-black rounded-xl text-black font-black text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
          
          <button
            type="button"
            onClick={handleApplyFilter}
            className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>TERAPKAN FILTER</span>
          </button>
        </div>

      </aside>
    </>
  );
};
