import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, CheckCircle2, Copy, Clock, ArrowLeft } from 'lucide-react';

export const CheckoutModal = () => {
  const {
    user,
    cart,
    cartSubtotal,
    cartDiscount,
    isFreeShippingApplied,
    formatPrice,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsReceiptOpen,
    checkoutOrder,
    showToast
  } = useShop();

  const [customerInfo, setCustomerInfo] = useState({
    name: 'Arya Pratama',
    email: 'arya.pratama@gmail.com',
    phone: '081289341029',
    address: 'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
    notes: 'Mohon cantumkan stiker GETRAW di dalam paket.'
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && isCheckoutOpen) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user, isCheckoutOpen]);

  const [shippingMethod, setShippingMethod] = useState('regular'); // 'regular', 'express', 'pickup'
  const [paymentOption, setPaymentOption] = useState('qris'); // 'qris', 'mandiri', 'bca', 'cod'
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [loading, setLoading] = useState(false);

  // Live countdown timer for QRIS
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Calculate Shipping fee
  let shippingCost = 12000;
  if (shippingMethod === 'express') shippingCost = 24000;
  if (shippingMethod === 'pickup' || isFreeShippingApplied || cartSubtotal >= 300000) shippingCost = 0;

  const grandTotal = Math.max(0, cartSubtotal - cartDiscount) + shippingCost;

  const handleCopyVa = (vaNumber) => {
    navigator.clipboard.writeText(vaNumber);
    showToast(`Nomor VA (${vaNumber}) berhasil disalin!`);
  };

  const handleProcessPayment = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      showToast('Lengkapi nama, email & nomor WhatsApp terlebih dahulu!', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim(),
          address: customerInfo.address.trim()
        },
        items: cart.map(item => ({
          id: String(item.id),
          size: item.size,
          quantity: item.quantity,
          title: item.title,
          price: item.price,
          image: item.image
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shippingCost: shippingCost,
        grandTotal: grandTotal,
        paymentMethod: paymentOption.toUpperCase(),
        shippingMethod: shippingMethod
      };

      await checkoutOrder(orderData);
      
      setIsCheckoutOpen(false);
      
      // Trigger celebratory confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setIsReceiptOpen(true);
      showToast('Pesanan berhasil dibuat! Silakan verifikasi pembayaran.');
    } catch {
      // Error handled by context showToast
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-neutral-200 animate-fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-black tracking-wider uppercase font-display">Sistem Belanja Mandiri Kiosk</h4>
              <p className="text-[10px] text-neutral-300 font-mono">Self-Service Checkout • GETRAW®</p>
            </div>
          </div>
          <button onClick={() => setIsCheckoutOpen(false)} className="text-neutral-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral-800">
          
          {/* Step 1: Customer Data */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Data Pembeli Mandiri</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-3.5 border border-neutral-200">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 bg-white text-xs focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="email@domain.com"
                  className="w-full border border-neutral-300 p-2.5 bg-white text-xs focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 bg-white text-xs focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Alamat Pengiriman Lengkap</label>
                <textarea
                  rows="2"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full border border-neutral-300 p-2 bg-white text-xs focus:border-black focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Courier */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Pilihan Ekspedisi Pengiriman</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className={`border p-3 cursor-pointer flex flex-col justify-between relative transition-all ${
                shippingMethod === 'regular' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="regular"
                  checked={shippingMethod === 'regular'}
                  onChange={() => setShippingMethod('regular')}
                  className="accent-black absolute top-3 right-3"
                />
                <div>
                  <p className="font-bold text-xs">JNE / SiCepat Reg</p>
                  <p className="text-[10px] text-neutral-500">Estimasi 2-3 Hari Kerja</p>
                </div>
                <p className="font-bold text-xs mt-2 font-mono">
                  {isFreeShippingApplied || cartSubtotal >= 300000 ? 'GRATIS (Rp 0)' : 'Rp 12,000'}
                </p>
              </label>

              <label className={`border p-3 cursor-pointer flex flex-col justify-between relative transition-all ${
                shippingMethod === 'express' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                  className="accent-black absolute top-3 right-3"
                />
                <div>
                  <p className="font-bold text-xs">Next Day Express</p>
                  <p className="text-[10px] text-neutral-500">Estimasi Besok Sampai</p>
                </div>
                <p className="font-bold text-xs mt-2 font-mono">Rp 24,000</p>
              </label>

              <label className={`border p-3 cursor-pointer flex flex-col justify-between relative transition-all ${
                shippingMethod === 'pickup' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value="pickup"
                  checked={shippingMethod === 'pickup'}
                  onChange={() => setShippingMethod('pickup')}
                  className="accent-black absolute top-3 right-3"
                />
                <div>
                  <p className="font-bold text-xs">Ambil di Store</p>
                  <p className="text-[10px] text-neutral-500">BSD City / Kemang Store</p>
                </div>
                <p className="font-bold text-xs text-emerald-600 mt-2">GRATIS (Rp 0)</p>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Metode Pembayaran Mandiri</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className={`border p-3 cursor-pointer flex items-center space-x-2.5 transition-all ${
                paymentOption === 'qris' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="qris"
                  checked={paymentOption === 'qris'}
                  onChange={() => setPaymentOption('qris')}
                  className="accent-black"
                />
                <div>
                  <p className="font-bold text-xs flex items-center space-x-1">
                    <span>QRIS Instant</span>
                    <span className="bg-red-600 text-white text-[9px] px-1 font-bold">Semua E-Wallet</span>
                  </p>
                  <p className="text-[10px] text-neutral-500">BCA, Mandiri, GoPay, OVO</p>
                </div>
              </label>

              <label className={`border p-3 cursor-pointer flex items-center space-x-2.5 transition-all ${
                paymentOption === 'mandiri' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="mandiri"
                  checked={paymentOption === 'mandiri'}
                  onChange={() => setPaymentOption('mandiri')}
                  className="accent-black"
                />
                <div>
                  <p className="font-bold text-xs">Mandiri VA</p>
                  <p className="text-[10px] text-neutral-500">Verifikasi Otomatis</p>
                </div>
              </label>

              <label className={`border p-3 cursor-pointer flex items-center space-x-2.5 transition-all ${
                paymentOption === 'bca' ? 'border-black bg-neutral-50 shadow-xs' : 'border-neutral-300 hover:border-black'
              }`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="bca"
                  checked={paymentOption === 'bca'}
                  onChange={() => setPaymentOption('bca')}
                  className="accent-black"
                />
                <div>
                  <p className="font-bold text-xs">BCA VA</p>
                  <p className="text-[10px] text-neutral-500">Konfirmasi 10 Detik</p>
                </div>
              </label>
            </div>

            {/* Dynamic Payment Details Preview */}
            <div className="p-4 border border-neutral-300 bg-neutral-50 space-y-3">
              {paymentOption === 'qris' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-3 border border-neutral-300 shadow-xs flex flex-col items-center">
                    {/* SVG QR Code Simulation */}
                    <svg className="w-28 h-28" viewBox="0 0 100 100" fill="black">
                      <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                      <rect x="35" y="5" width="8" height="8" />
                      <rect x="48" y="5" width="8" height="8" />
                      <rect x="35" y="18" width="15" height="5" />
                      <rect x="40" y="35" width="20" height="20" />
                      <rect x="65" y="40" width="8" height="15" />
                      <rect x="15" y="40" width="12" height="6" />
                      <rect x="5" y="55" width="15" height="8" />
                      <rect x="75" y="75" width="20" height="20" />
                      <rect x="40" y="70" width="10" height="25" />
                      <rect x="60" y="70" width="8" height="8" />
                    </svg>
                    <span className="text-[9px] font-bold tracking-widest text-neutral-500 mt-1 uppercase">QRIS Nasional</span>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-bold text-xs text-neutral-900">Scan QR Code dengan aplikasi pembayaran Anda</p>
                    <p className="text-[11px] text-neutral-600">Buka BCA Mobile, Livin' Mandiri, GoPay, ShopeePay, OVO, atau Dana.</p>
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[11px] text-amber-700 font-bold mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sisa batas waktu pembayaran: <strong className="font-mono text-sm">{formatTimer(timerSeconds)}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {paymentOption === 'mandiri' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white p-3 border border-neutral-300">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Bank Mandiri Virtual Account</span>
                      <p className="font-mono text-base font-bold text-black tracking-wider">8870 8128 9341 0290</p>
                    </div>
                    <button
                      onClick={() => handleCopyVa('8870812893410290')}
                      className="px-3 py-1.5 text-[11px] font-bold border border-black hover:bg-black hover:text-white transition-all flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin VA</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500">Transfer tepat sesuai total tagihan agar terverifikasi otomatis dalam 10 detik.</p>
                </div>
              )}

              {paymentOption === 'bca' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white p-3 border border-neutral-300">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Bank BCA Virtual Account</span>
                      <p className="font-mono text-base font-bold text-black tracking-wider">1268 0812 8934 1029</p>
                    </div>
                    <button
                      onClick={() => handleCopyVa('1268081289341029')}
                      className="px-3 py-1.5 text-[11px] font-bold border border-black hover:bg-black hover:text-white transition-all flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin VA</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500">Transfer tepat sesuai total tagihan agar terverifikasi otomatis dalam 10 detik.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="border-t border-neutral-200 pt-4 space-y-2 bg-white">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal Produk ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
              <span className="font-mono font-semibold">{formatPrice(cartSubtotal)}</span>
            </div>

            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon Kupon</span>
                <span className="font-mono">-{formatPrice(cartDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Ongkos Kirim ({shippingMethod.toUpperCase()})</span>
              <span className="font-mono font-semibold">
                {shippingCost === 0 ? 'GRATIS (Rp 0)' : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="flex justify-between text-black font-black text-base pt-3 border-t border-neutral-200">
              <span>Total Tagihan Mandiri</span>
              <span className="text-lg text-black font-mono">{formatPrice(grandTotal)}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-black flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <button
            onClick={handleProcessPayment}
            disabled={loading}
            className="bg-black text-white px-6 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-neutral-800 flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Pesanan</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
