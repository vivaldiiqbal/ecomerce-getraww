import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

export const OrderTrackerModal = () => {
  const { drawers, toggleDrawer, lastOrder, formatPrice, showToast } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (drawers.orderTracker && lastOrder) {
      setSearchedOrder(lastOrder);
      setSearchQuery(lastOrder.orderNumber);
    }
  }, [drawers.orderTracker, lastOrder]);

  if (!drawers.orderTracker) return null;

  const currentOrder = searchedOrder || lastOrder;

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Masukkan nomor pesanan terlebih dahulu.');
      return;
    }

    setSearchError('');
    setIsLoading(true);

    try {
      const cleanNumber = query.replace(/^#+/, '');
      const res = await api.get(`/orders/${encodeURIComponent(cleanNumber)}`);
      setSearchedOrder(res.data.data);
      showToast(`Pesanan #${cleanNumber} ditemukan!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Pesanan tidak ditemukan. Periksa kembali nomor transaksi Anda.';
      setSearchError(msg);
      setSearchedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (status) => {
    // Returns status flags for 4 tracking steps
    const isPaid = currentOrder?.paymentStatus === 'QRIS INSTANT LUNAS';
    const isCancelled = status === 'CANCELLED';
    const isShipped = status === 'SHIPPED' || status === 'DELIVERED';
    const isDelivered = status === 'DELIVERED';
    const isProcessing = status === 'PROCESSING' || isShipped;

    return { isPaid, isCancelled, isProcessing, isShipped, isDelivered };
  };

  const statusFlags = currentOrder ? getStepStatus(currentOrder.orderStatus) : {};

  return (
    <>
      <div
        onClick={() => toggleDrawer('orderTracker', false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform flex flex-col animate-slide-left">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-display">Lacak Pesanan Mandiri</h3>
              <p className="text-[10px] text-neutral-300 font-mono">Status Pengiriman Real-Time</p>
            </div>
          </div>
          <button
            onClick={() => toggleDrawer('orderTracker', false)}
            className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-neutral-800">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="cth: #THX-20261011-882"
                className="flex-1 border border-neutral-300 p-2.5 text-xs uppercase font-mono focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {searchError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          {currentOrder ? (
            <>
              {/* Order Details Card */}
              <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="font-mono font-bold text-sm text-black">{currentOrder.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-xs ${
                    currentOrder.paymentStatus === 'QRIS INSTANT LUNAS' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentOrder.paymentMethod} {currentOrder.paymentStatus === 'QRIS INSTANT LUNAS' ? 'LUNAS' : 'PENDING'}
                  </span>
                </div>
                <div className="text-[11px] space-y-1 text-neutral-600">
                  <p><strong>Penerima:</strong> {currentOrder.customer?.name}</p>
                  <p><strong>Kurir:</strong> {currentOrder.shippingMethod || 'JNE REG'}</p>
                  {currentOrder.trackingNumber && (
                    <p><strong>No. Resi:</strong> <span className="font-mono font-bold text-black">{currentOrder.trackingNumber}</span></p>
                  )}
                  <p><strong>Total:</strong> <span className="font-mono text-black font-bold">{formatPrice(currentOrder.grandTotal)}</span></p>
                </div>
              </div>

              {/* Real-time Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Status Perjalanan Paket
                </h4>

                {currentOrder.orderStatus === 'CANCELLED' ? (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-sm space-y-1">
                    <p className="font-bold text-xs">Pesanan Dibatalkan</p>
                    <p className="text-[11px]">Transaksi ini telah dibatalkan oleh pihak toko atau sistem.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 border-l-2 border-neutral-200">
                    
                    {/* Step 1: Pembayaran / Dibuat */}
                    <div className="relative">
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        statusFlags.isPaid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {statusFlags.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </span>
                      <p className="font-bold text-xs text-neutral-900">
                        {statusFlags.isPaid ? 'Pembayaran Diverifikasi' : 'Menunggu Verifikasi Pembayaran'}
                      </p>
                      <p className="text-[10px] text-neutral-500">{currentOrder.paidAt || currentOrder.date}</p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {statusFlags.isPaid 
                          ? `Sistem memverifikasi pembayaran via ${currentOrder.paymentMethod}.`
                          : `Silakan selesaikan pembayaran untuk memproses pesanan.`}
                      </p>
                    </div>

                    {/* Step 2: Dikemas */}
                    <div className={`relative ${statusFlags.isProcessing ? 'opacity-100' : 'opacity-40'}`}>
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        statusFlags.isProcessing ? 'bg-emerald-500 text-white' : 'bg-neutral-300'
                      }`}>
                        <PackageCheck className="w-3 h-3" />
                      </span>
                      <p className="font-bold text-xs text-neutral-900">Pesanan Diproses & Dikemas</p>
                      <p className="text-[10px] text-neutral-500">Warehouse BSD City</p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {statusFlags.isProcessing
                          ? 'Pakaian sedang dikemas rapi dengan stiker & polybag khusus GETRAW.'
                          : 'Menunggu proses pengemasan setelah pembayaran diverifikasi.'}
                      </p>
                    </div>

                    {/* Step 3: Kurir */}
                    <div className={`relative ${statusFlags.isShipped ? 'opacity-100' : 'opacity-40'}`}>
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        statusFlags.isShipped ? 'bg-black text-white' : 'bg-neutral-300'
                      }`}>
                        <Truck className="w-3 h-3" />
                      </span>
                      <p className="font-bold text-xs text-neutral-900">Dalam Pengiriman Kurir</p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {currentOrder.trackingNumber ? `Resi: ${currentOrder.trackingNumber}` : 'Menunggu nomor resi kurir'}
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {statusFlags.isShipped 
                          ? 'Paket telah diserahkan kepada kurir dan dalam perjalanan ke alamat tujuan.'
                          : 'Paket belum diserahkan ke pihak ekspedisi.'}
                      </p>
                    </div>

                    {/* Step 4: Selesai */}
                    <div className={`relative ${statusFlags.isDelivered ? 'opacity-100' : 'opacity-40'}`}>
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        statusFlags.isDelivered ? 'bg-emerald-600 text-white' : 'bg-neutral-300'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                      <p className="font-bold text-xs text-neutral-700">Paket Diterima Pelanggan</p>
                      <p className="text-[10px] text-neutral-500">
                        {statusFlags.isDelivered ? 'Pesanan telah selesai diantar' : 'Estimasi 1-2 hari kerja'}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <PackageCheck className="w-12 h-12 mx-auto stroke-1 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Lacak Pesanan Anda</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                Ketik Nomor Transaksi (#THX-YYYYMMDD-XXX) yang Anda dapatkan saat checkout untuk memantau status resi dan pengiriman.
              </p>
            </div>
          )}

        </div>

      </aside>
    </>
  );
};

