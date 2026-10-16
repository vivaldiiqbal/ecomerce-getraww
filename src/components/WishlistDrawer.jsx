import React from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, X, ShoppingBag, Trash2 } from 'lucide-react';
import { getImageUrl } from '../services/api';

export const WishlistDrawer = () => {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    formatPrice,
    drawers,
    toggleDrawer
  } = useShop();

  if (!drawers.wishlist) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <>
      <div
        onClick={() => toggleDrawer('wishlist', false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform flex flex-col animate-slide-left">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 fill-black text-black" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Produk Favorit Saya ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={() => toggleDrawer('wishlist', false)}
            className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {wishlistedProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400 space-y-2">
              <Heart className="w-12 h-12 stroke-1 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Belum ada wishlist</p>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Klik ikon hati pada produk streetwear untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            wishlistedProducts.map(product => {
              const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'All Size';
              const displayPrice = product.finalPrice ?? product.price ?? 0;

              return (
                <div key={product.id} className="flex space-x-3.5 pb-4 border-b border-neutral-100 items-center">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    className="w-16 h-16 object-contain bg-neutral-50 p-1 border border-neutral-200 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-1">
                        {product.title}
                      </h4>
                      <span className="text-xs font-bold text-black mt-1 block">
                        {formatPrice(displayPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => addToCart(product, defaultSize, 1)}
                        className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-800 flex items-center space-x-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>+ Kantong ({defaultSize})</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-[11px] text-neutral-400 hover:text-red-600 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </aside>
    </>
  );
};
