import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getImageUrl } from '../services/api';
import { X, ShoppingBag, Ruler, Heart } from 'lucide-react';

export const QuickViewModal = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsSizeGuideOpen
  } = useShop();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct && quickViewProduct.sizes.length > 0) {
      setSelectedSize(quickViewProduct.sizes[0]);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full p-6 shadow-2xl relative border border-neutral-200 animate-fade-in my-auto max-h-[92vh] flex flex-col sm:flex-row gap-6 overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-black p-1 bg-white/80 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="w-full sm:w-1/2 bg-[#f8f8f8] flex flex-col items-center justify-center p-4 relative aspect-square sm:aspect-auto">
          {quickViewProduct.discount && (
            <span className="absolute top-3 left-3 bg-black text-white text-xs font-black px-2.5 py-1 uppercase z-10">
              {quickViewProduct.discount} OFF
            </span>
          )}
          <img
            src={getImageUrl(quickViewProduct.image)}
            alt={quickViewProduct.title}
            className="max-h-72 object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+'; }}
          />
        </div>

        {/* Right: Product Details */}
        <div className="w-full sm:w-1/2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              <span>{quickViewProduct.category}</span>
              <span>•</span>
              <span className="text-emerald-600">In Stock ({quickViewProduct.stockCount || 8} pcs)</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug mt-1 font-display">
              {quickViewProduct.title}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-lg font-black text-black">
                {formatPrice(quickViewProduct.finalPrice ?? quickViewProduct.price ?? 0)}
              </span>
              {(quickViewProduct.originalPrice !== undefined || (quickViewProduct.price && quickViewProduct.price !== quickViewProduct.finalPrice)) && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(quickViewProduct.originalPrice ?? quickViewProduct.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-600 mt-3 leading-relaxed border-t border-b border-neutral-100 py-2.5">
              {quickViewProduct.description}
            </p>

            {/* Fabric specs */}
            <div className="mt-3 text-[11px] text-neutral-700 space-y-1 bg-neutral-50 p-2.5 border border-neutral-200">
              <p><strong>Bahan:</strong> {quickViewProduct.fabric}</p>
              <p><strong>Perawatan:</strong> {quickViewProduct.care}</p>
            </div>

            {/* Size Selector */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Pilih Ukuran:</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-black flex items-center space-x-1 underline"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-1.5 border text-xs font-bold transition-all ${
                      selectedSize === sz
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 text-neutral-800 hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Jumlah:</span>
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-xs hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-xs hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center space-x-2 border-t border-neutral-200">
            <button
              onClick={() => toggleWishlist(quickViewProduct.id)}
              className={`p-3 border text-xs transition-colors ${
                isWishlisted
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 text-neutral-800 hover:border-black'
              }`}
              title="Tambah ke Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tambah ke Kantong</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
