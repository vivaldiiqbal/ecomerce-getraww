import React, { useState, useEffect, useCallback } from 'react';
import { api, getImageUrl } from '../../services/api';
import { Loader2, Search, Edit, X, Save, CheckCircle2, Package, Clock, Truck } from 'lucide-react';

export const OrderList = ({ onError, onSuccessToast }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders');
      // Sort orders by newest first
      const sortedOrders = (res.data.data || []).reverse();
      setOrders(sortedOrders);
    } catch {
      onError('Gagal memuat daftar pesanan.');
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openUpdateModal = useCallback((order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus || 'PENDING');
    setEditTracking(order.trackingNumber || '');
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const targetIdentifier = encodeURIComponent(String(selectedOrder.orderNumber || selectedOrder.id || '').replace(/^#+/, ''));
      
      const payload = {
        status: editStatus,
        orderStatus: editStatus,
        trackingNumber: editTracking.trim()
      };

      const res = await api.put(`/orders/${targetIdentifier}/status`, payload);
      const updatedOrder = res.data?.data;

      setOrders(prevOrders => prevOrders.map(order => {
        if (order.orderNumber === selectedOrder.orderNumber) {
          return {
            ...order,
            orderStatus: updatedOrder?.orderStatus || editStatus,
            trackingNumber: updatedOrder?.trackingNumber !== undefined ? updatedOrder.trackingNumber : editTracking.trim(),
            ...(updatedOrder ? updatedOrder : {})
          };
        }
        return order;
      }));
      
      onSuccessToast?.(`Status pesanan ${selectedOrder.orderNumber} berhasil diperbarui.`);
      setSelectedOrder(null);
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      onError?.(serverMessage || 'Gagal memperbarui status pesanan.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedOrder, editStatus, editTracking, onSuccessToast, onError]);

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o => 
      (o.orderNumber || '').toLowerCase().includes(q) || 
      (o.customer?.name || '').toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center w-max"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center w-max"><Package className="w-3 h-3 mr-1"/> Diproses</span>;
      case 'SHIPPED':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center w-max"><Truck className="w-3 h-3 mr-1"/> Dikirim</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1"/> Selesai</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center w-max"><X className="w-3 h-3 mr-1"/> Dibatalkan</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-800 px-2 py-1 text-[10px] font-bold uppercase rounded-sm">Unknown</span>;
    }
  };

  return (
    <div className="bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200 rounded-none animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari No. Pesanan / Nama Pelanggan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 text-sm focus:border-black focus:outline-none rounded-none transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-black text-[11px] uppercase tracking-wider text-neutral-500 bg-white">
              <th className="py-4 px-4 font-black text-black">No. Pesanan</th>
              <th className="py-4 px-4 font-black text-black">Tanggal</th>
              <th className="py-4 px-4 font-black text-black">Pelanggan</th>
              <th className="py-4 px-4 font-black text-black">Total Transaksi</th>
              <th className="py-4 px-4 font-black text-black">Pembayaran</th>
              <th className="py-4 px-4 font-black text-black">Status Order</th>
              <th className="py-4 px-4 font-black text-center text-black">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Memuat data pesanan...
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500 font-medium">
                  Tidak ada pesanan ditemukan.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderNumber} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{order.date}</td>
                  <td className="py-3 px-4 text-xs font-semibold">{order.customer?.name}</td>
                  <td className="py-3 px-4 text-xs font-bold">{formatPrice(order.grandTotal)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-sm ${order.paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(order.orderStatus || 'PENDING')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => openUpdateModal(order)}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-black hover:bg-neutral-800 transition-colors rounded-sm uppercase tracking-wider flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Kelola
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border border-neutral-200 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Kelola Pesanan</h3>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-6">
              
              {/* Customer Info */}
              <div className="bg-neutral-50 p-4 border border-neutral-200 text-xs">
                <h4 className="font-bold uppercase tracking-wider mb-2 border-b border-neutral-200 pb-2">Data Pelanggan</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-500 block mb-1">Nama:</span>
                    <span className="font-semibold">{selectedOrder.customer?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">WhatsApp:</span>
                    <span className="font-mono">{selectedOrder.customer?.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 block mb-1">Alamat Pengiriman:</span>
                    <span className="font-medium leading-relaxed block">{selectedOrder.customer?.address}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-bold uppercase tracking-wider mb-3 text-xs">Item Pesanan ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 border border-neutral-200 p-2 items-center">
                      <img src={getImageUrl(item.image)} alt={item.title} className="w-12 h-12 object-contain bg-neutral-50" />
                      <div className="flex-1">
                        <p className="font-bold text-xs">{item.title}</p>
                        <p className="text-[10px] text-neutral-500">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-xs">
                        {formatPrice(item.itemTotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="font-bold uppercase tracking-wider mb-4 text-xs">Update Status Pengiriman</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase">Status Pesanan</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 bg-white text-xs font-bold uppercase focus:border-black focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">Pending (Menunggu)</option>
                      <option value="PROCESSING">Processing (Diproses)</option>
                      <option value="SHIPPED">Shipped (Dikirim)</option>
                      <option value="DELIVERED">Delivered (Selesai)</option>
                      <option value="CANCELLED">Cancelled (Batal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase">Nomor Resi (Tracking)</label>
                    <input 
                      type="text" 
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="Masukkan No. Resi (Opsional)"
                      className="w-full border border-neutral-300 p-2.5 bg-neutral-50 text-xs font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black"
              >
                Batal
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center disabled:opacity-50"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
