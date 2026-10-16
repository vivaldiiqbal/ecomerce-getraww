import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getImageUrl } from '../services/api';
import { ShoppingBag, X, Truck, Trash2, Tag, ScanLine, ArrowRight, Check } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    cartItemsCount,
    cartSubtotal,
    cartDiscount,
    isFreeShippingApplied,
    formatPrice,
    updateCartQuantity,
    removeFromCart,
    drawers,
    toggleDrawer,
    setIsCheckoutOpen,
    appliedPromo,
    applyPromoCode,
    removePromoCode
  } = useShop();

  const [promoInput, setPromoInput] = useState('');

  if (!drawers.cart) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput('');
    }
  };

  const freeShippingThreshold = 300000;
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const grandTotal = Math.max(0, cartSubtotal - cartDiscount);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={() => toggleDrawer('cart', false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 animate-fade-in"
      />

      {/* Cart Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col animate-slide-left">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Kantong Belanja ({cartItemsCount})
            </h3>
          </div>
          <button
            onClick={() => toggleDrawer('cart', false)}
            className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Notice Progress Bar */}
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
          {isFreeShippingApplied || cartSubtotal >= freeShippingThreshold ? (
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Selamat! Pesanan Anda berhak mendapat <strong>GRATIS ONGKIR</strong>.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-700">
                <span className="flex items-center space-x-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-black" />
                  <span>Tambahkan <strong>{formatPrice(remainingForFreeShipping)}</strong> lagi untuk Gratis Ongkir</span>
                </span>
                <span className="font-bold text-black">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400 space-y-2">
              <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Kantong belanja masih kosong</p>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Pilih t-shirt, hoodie, atau aksesoris streetwear favorit Anda di katalog.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.size}`} className="flex space-x-3.5 pb-4 border-b border-neutral-100">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-16 h-16 object-contain bg-neutral-50 p-1 border border-neutral-200 flex-shrink-0"
                  onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+'; }}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block text-[10px] bg-black text-white px-1.5 py-0.2 font-extrabold uppercase">
                        Size: {item.size}
                      </span>
                      <span className="text-xs font-bold text-neutral-900">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center border border-neutral-300 bg-white">
                      <button
                        onClick={() => updateCartQuantity(idx, -1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(idx, 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-[11px] text-neutral-400 hover:text-red-600 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Kode Promo (cth: FREESHIP)"
                  className="w-full border border-neutral-300 text-xs pl-8 pr-2 py-2 uppercase font-medium focus:outline-none focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 text-white px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Pasang
              </button>
            </form>

            {/* Applied Promo Tag */}
            {appliedPromo && (
              <div className="flex items-center justify-between bg-neutral-100 px-3 py-1.5 border border-neutral-300 text-xs font-semibold">
                <span className="text-black flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>Kupon {appliedPromo.code}: {appliedPromo.description}</span>
                </span>
                <button onClick={removePromoCode} className="text-red-500 hover:text-red-700 font-bold ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-neutral-900">{formatPrice(cartSubtotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Potongan Promo</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-neutral-500">
                <span>Pajak & Biaya Layanan</span>
                <span className="text-emerald-600 font-medium">Gratis (Rp 0)</span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold text-black border-t border-neutral-200 pt-2">
                <span>Total Estimasi</span>
                <span className="text-base font-black font-mono">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                toggleDrawer('cart', false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-black text-white py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <ScanLine className="w-4 h-4" />
              <span>Checkout Mandiri Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-neutral-400 font-medium">
              Sistem Mandiri Kiosk • Pembayaran QRIS / VA Instant & Struk Otomatis
            </p>
          </div>
        )}

      </aside>
    </>
  );
};
