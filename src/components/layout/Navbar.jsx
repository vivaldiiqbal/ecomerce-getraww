import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Search, ShoppingBag, Heart, User, Menu, X, Tag, SlidersHorizontal, Truck } from 'lucide-react';

export const Navbar = () => {
  const {
    user,
    cartItemsCount,
    wishlist,
    filters,
    setFilters,
    activeFiltersCount,
    resetAllFilters,
    toggleDrawer
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const quickSearchTags = ['Tees', 'Hoodie', 'Striped', 'Diskon 50%', 'Pure Soul', 'Cargo'];

  const handleSearchChange = React.useCallback((e) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  }, [setFilters]);

  const handleTagClick = React.useCallback((tag) => {
    if (tag === 'Diskon 50%') {
      setFilters(prev => ({ ...prev, productType: 'discount', searchQuery: '' }));
    } else {
      setFilters(prev => ({ ...prev, searchQuery: tag }));
    }
  }, [setFilters]);

  const handleClearSearch = React.useCallback(() => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  }, [setFilters]);

  // Determine dynamic styling based on scroll state
  const navbarClasses = isScrolled || isSearchOpen
    ? "bg-white/95 backdrop-blur-md text-black border-b border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    : "bg-black/95 backdrop-blur-md text-white border-b border-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.2)]";

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${navbarClasses}`}>
      
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Hamburger Menu Icon */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleDrawer('mobileMenu', true)}
            aria-label="Buka Menu"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors flex items-center space-x-2"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
            <span className="hidden md:inline-block text-xs font-bold uppercase tracking-wider">Menu</span>
          </button>
        </div>

        {/* Center: GETRAW Logo */}
        <div
          className="text-center select-none cursor-pointer group flex flex-col items-center"
          onClick={resetAllFilters}
        >
          <img 
            src="/logo-transparent.png" 
            alt="GETRAW Logo" 
            className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.03] filter drop-shadow-sm" 
          />
        </div>

        {/* Right: Filter, Search, Wishlist, Bag, Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">

          {/* Filter Streetwear Button */}
          <button
            onClick={() => toggleDrawer('filter', true)}
            aria-label="Filter Streetwear"
            title="Filter Streetwear"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors relative"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.75]" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Cari Produk"
            className={`p-2 rounded-md transition-colors ${
              isSearchOpen ? 'bg-black text-white' : 'hover:bg-neutral-500/20'
            }`}
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleDrawer('wishlist', true)}
            aria-label="Wishlist"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors relative hidden sm:block"
          >
            <Heart className={`w-5 h-5 stroke-[1.75] ${wishlist.length > 0 ? 'fill-current' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Order Tracker Button */}
          <button
            onClick={() => toggleDrawer('orderTracker', true)}
            aria-label="Lacak Pesanan"
            title="Lacak Pesanan"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors relative"
          >
            <Truck className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Shopping Bag Button with Counter */}
          <button
            onClick={() => toggleDrawer('cart', true)}
            aria-label="Keranjang Belanja"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => toggleDrawer('auth', true)}
            aria-label="Masuk / Daftar Akun"
            className="p-2 hover:bg-neutral-500/20 rounded-md transition-colors relative"
            title={user ? `Akun Saya (${user.name})` : "Masuk / Daftar Akun"}
          >
            <User className="w-5 h-5 stroke-[1.75]" />
            {user && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          {user && user.role === 'admin' && (
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center text-[10px] font-black bg-white text-black px-3 py-1.5 rounded-sm hover:bg-neutral-200 transition-colors tracking-widest border border-transparent shadow-sm"
            >
              [ ADMIN PANEL ]
            </a>
          )}

        </div>
      </div>

      {/* Dropdown Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-neutral-200 bg-white text-black px-4 py-4 transition-all animate-fade-in shadow-inner">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari kaos, kemeja, hoodie, aksesoris, promo DISKON 50%..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-none pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-black font-medium shadow-xs text-black"
                autoFocus
              />
              {filters.searchQuery && (
                <button onClick={handleClearSearch} className="absolute right-3 text-xs text-neutral-400 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Tag Recommendations */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-medium text-[11px] mr-1 flex items-center">
                <Tag className="w-3 h-3 mr-1" /> Rekomendasi:
              </span>
              {quickSearchTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-800 hover:border-black hover:bg-black hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
