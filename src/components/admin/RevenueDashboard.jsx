import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Calendar,
  User,
  ArrowUpRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export const RevenueDashboard = ({ onError, onSuccessToast }) => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSuccessfulOrders: 0,
    averageOrderValue: 0,
    recentSuccessfulOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const formatRupiah = useCallback((val) => {
    const num = Number(val);
    if (!Number.isFinite(num) || isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  }, []);

  const fetchRevenueAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent && isMountedRef.current) setIsLoading(true);
    if (isSilent && isMountedRef.current) setIsRefreshing(true);

    try {
      const res = await api.get('/analytics/revenue');
      const data = res.data?.data || {};

      if (isMountedRef.current) {
        const totalRevenue = Number(data.totalRevenue) || 0;
        const totalSuccessfulOrders = Number(data.totalSuccessfulOrders) || 0;

        // Anti-Crash: Hindari pembagian nol yang menghasilkan NaN atau Infinity
        const averageOrderValue = totalSuccessfulOrders > 0
          ? (Number(data.averageOrderValue) || Math.round(totalRevenue / totalSuccessfulOrders))
          : 0;

        setAnalytics({
          totalRevenue,
          totalSuccessfulOrders,
          averageOrderValue,
          recentSuccessfulOrders: Array.isArray(data.recentSuccessfulOrders) ? data.recentSuccessfulOrders : []
        });

        if (isSilent && onSuccessToast) {
          onSuccessToast('Data analitik pendapatan berhasil diperbarui.');
        }
      }
    } catch (err) {
      if (isMountedRef.current && onError) {
        const msg = err.response?.data?.message || err.message || 'Gagal memuat analitik pendapatan.';
        onError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [onError, onSuccessToast]);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [fetchRevenueAnalytics]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50 p-4 border border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Real-Time Revenue Engine
          </span>
          <span className="text-[11px] text-neutral-500 font-mono hidden md:inline">
            (Single Source of Truth: Data Agregasi Pesanan Sukses)
          </span>
        </div>

        <button
          type="button"
          onClick={() => fetchRevenueAnalytics(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Memperbarui...' : 'Sinkronisasi Data'}
        </button>
      </div>

      {/* 3 Ringkasan Kartu Statistik (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Pendapatan Kotor */}
        <div className="bg-white border-2 border-black p-6 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
              Total Pendapatan Kotor
            </span>
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2 font-mono">
            {isLoading ? (
              <div className="h-8 w-36 bg-neutral-200 animate-pulse" />
            ) : (
              formatRupiah(analytics.totalRevenue)
            )}
          </div>
          <p className="text-[11px] font-medium text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Akumulasi pesanan lunas & terkirim
          </p>
        </div>

        {/* Card 2: Pesanan Berhasil */}
        <div className="bg-white border-2 border-black p-6 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
              Pesanan Berhasil
            </span>
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2 font-mono">
            {isLoading ? (
              <div className="h-8 w-24 bg-neutral-200 animate-pulse" />
            ) : (
              `${analytics.totalSuccessfulOrders} Transaksi`
            )}
          </div>
          <p className="text-[11px] font-medium text-neutral-500 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-black shrink-0" />
            Otomatis berkurang jika pesanan dibatalkan
          </p>
        </div>

        {/* Card 3: Rata-Rata Nilai Transaksi (AOV) */}
        <div className="bg-white border-2 border-black p-6 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
              Rata-Rata Transaksi (AOV)
            </span>
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2 font-mono">
            {isLoading ? (
              <div className="h-8 w-36 bg-neutral-200 animate-pulse" />
            ) : (
              formatRupiah(analytics.averageOrderValue)
            )}
          </div>
          <p className="text-[11px] font-medium text-neutral-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-black shrink-0" />
            Pendapatan dibagi total transaksi sukses
          </p>
        </div>
      </div>

      {/* Tabel Riwayat Pemasukan Terkini (5-10 Transaksi Terakhir) */}
      <div className="bg-white border border-neutral-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black">
              Riwayat Pemasukan Terkini
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Daftar transaksi sukses penyumbang pendapatan toko GETRAW®
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-3 py-1 self-start sm:self-auto">
            {analytics.recentSuccessfulOrders.length} Transaksi Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b-2 border-black text-[11px] uppercase tracking-wider text-neutral-500 bg-neutral-50">
                <th className="py-3.5 px-5 font-black text-black">No. Pesanan</th>
                <th className="py-3.5 px-5 font-black text-black">Tanggal</th>
                <th className="py-3.5 px-5 font-black text-black">Pelanggan</th>
                <th className="py-3.5 px-5 font-black text-black">Metode Bayar</th>
                <th className="py-3.5 px-5 font-black text-black">Nilai Transaksi</th>
                <th className="py-3.5 px-5 font-black text-black text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span className="font-medium font-mono">Mengagregasi data pendapatan...</span>
                    </div>
                  </td>
                </tr>
              ) : analytics.recentSuccessfulOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <DollarSign className="w-8 h-8 text-neutral-300 stroke-1" />
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Belum Ada Pemasukan Sukses
                      </p>
                      <p className="text-[11px] text-neutral-400 max-w-sm">
                        Pendapatan akan tercatat secara otomatis setelah pembeli menyelesaikan pembayaran QRIS atau pesanan berstatus sukses.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                analytics.recentSuccessfulOrders.map((order, idx) => (
                  <tr key={order.orderNumber || idx} className="hover:bg-neutral-50 transition-colors font-medium">
                    <td className="py-4 px-5 font-mono font-bold text-black">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-5 text-neutral-600 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        {order.date || order.paidAt || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-neutral-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div>
                          <p className="font-bold">{order.customer?.name || 'Customer'}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">{order.customer?.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-block bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-neutral-800">
                        {order.paymentMethod || 'QRIS'}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-black text-black">
                      {formatRupiah(order.grandTotal ?? order.totalAmount ?? order.subtotalFinal ?? 0)}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {order.paymentStatus || order.orderStatus || 'LUNAS'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
