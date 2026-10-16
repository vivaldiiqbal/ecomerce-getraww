import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Printer, CheckCircle, Truck } from 'lucide-react';

export const ReceiptModal = () => {
  const { isReceiptOpen, setIsReceiptOpen, lastOrder, formatPrice, simulatePayment, toggleDrawer } = useShop();
  const [loading, setLoading] = useState(false);

  if (!isReceiptOpen || !lastOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      await simulatePayment(lastOrder.orderNumber);
    } catch {
      // handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTracker = () => {
    setIsReceiptOpen(false);
    toggleDrawer('orderTracker', true);
  };

  const isPaid = (lastOrder.paymentStatus || '').includes('LUNAS') || lastOrder.paymentStatus === 'PAID';
  const subtotalAmount = lastOrder.subtotalFinal ?? lastOrder.subtotal ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-sm w-full p-6 font-mono text-xs shadow-2xl relative space-y-4 thermal-receipt animate-fade-in my-auto border border-neutral-300">
        
        {/* Printable Area Wrapper */}
        <div id="thermalReceiptPrintArea" className="space-y-4">
          
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-neutral-400">
            <img 
              src="/logo.png" 
              alt="GETRAW Logo" 
              className="h-8 w-auto mx-auto mb-1 object-contain" 
            />
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-0.5">Self-Service Kiosk & Online Store</p>
            <p className="text-[10px] text-neutral-400">BSD City / Jakarta - Indonesia</p>
          </div>

          {/* Meta Info */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-neutral-400">
            <div className="flex justify-between">
              <span className="text-neutral-500">NO. TRANSAKSI:</span>
              <span className="font-bold text-black">{lastOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">TANGGAL:</span>
              <span>{lastOrder.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">PELANGGAN:</span>
              <span className="font-semibold">{lastOrder.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">PEMBAYARAN:</span>
              <span className={`font-bold uppercase px-1 ${isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                {lastOrder.paymentMethod} {isPaid ? 'LUNAS' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2.5 py-2 border-b border-dashed border-neutral-400 max-h-48 overflow-y-auto no-scrollbar">
            {(lastOrder.items || []).map((item, i) => {
              const itemPrice = item.finalPrice ?? item.price ?? 0;
              return (
                <div key={i} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <p className="font-bold text-black line-clamp-1">{item.title}</p>
                    <span className="text-[10px] text-neutral-500">
                      {item.quantity}x @ {formatPrice(itemPrice)} ({item.size})
                    </span>
                  </div>
                  <span className="font-bold whitespace-nowrap">{formatPrice(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-neutral-600">
              <span>SUBTOTAL:</span>
              <span>{formatPrice(subtotalAmount)}</span>
            </div>

            {lastOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>DISKON KUPON:</span>
                <span>-{formatPrice(lastOrder.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>ONGKOS KIRIM:</span>
              <span>{lastOrder.shippingCost === 0 ? 'GRATIS' : formatPrice(lastOrder.shippingCost)}</span>
            </div>

            <div className="flex justify-between font-bold text-xs pt-2 border-t border-neutral-400 text-black">
              <span>TOTAL DIBAYAR:</span>
              <span className="text-sm font-black">{formatPrice(lastOrder.grandTotal)}</span>
            </div>
          </div>

          {/* Simulated Barcode */}
          <div className="text-center pt-2">
            <div className="inline-flex space-x-1 h-9 items-center justify-center">
              <span className="w-1 h-full bg-black"></span>
              <span className="w-0.5 h-full bg-black"></span>
              <span className="w-1.5 h-full bg-black"></span>
              <span className="w-0.5 h-full bg-black"></span>
              <span className="w-2 h-full bg-black"></span>
              <span className="w-1 h-full bg-black"></span>
              <span className="w-0.5 h-full bg-black"></span>
              <span className="w-1.5 h-full bg-black"></span>
              <span className="w-1 h-full bg-black"></span>
              <span className="w-2.5 h-full bg-black"></span>
              <span className="w-0.5 h-full bg-black"></span>
            </div>
            <p className="text-[9px] text-neutral-400 mt-1 uppercase tracking-widest font-bold">
              TERIMA KASIH TELAH BERBELANJA MANDIRI
            </p>
          </div>

        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="space-y-2 pt-3 border-t border-neutral-200 print:hidden">
          <div className="flex space-x-2">
            {!isPaid ? (
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="flex-1 bg-black text-white py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Simulasikan Bayar</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="flex-1 bg-black text-white py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
            )}
            <button
              onClick={() => setIsReceiptOpen(false)}
              className="flex-1 border border-neutral-400 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-100 text-neutral-800"
            >
              Selesai
            </button>
          </div>

          <button
            onClick={handleOpenTracker}
            className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 text-[10px] font-bold uppercase tracking-wider border border-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Lacak Status Paket Pesanan</span>
          </button>
        </div>

      </div>
    </div>
  );
};

