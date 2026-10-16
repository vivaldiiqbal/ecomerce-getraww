import React, { useState, useEffect } from 'react';
import { ProductTable } from './ProductTable';
import { CustomerList } from './CustomerList';
import { SettingsForm } from './SettingsForm';
import { OrderList } from './OrderList';
import { RevenueDashboard } from './RevenueDashboard';
import { Store, LogOut, Package, Users, Settings, AlertCircle, CheckCircle2, ShoppingCart, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  // 1. Sentralisasi State Navigasi: Tunggal di komponen induk AdminDashboard
  const [activeTab, setActiveTab] = useState('produk'); // 'pesanan', 'produk', 'pelanggan', 'pengaturan'

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser || savedUser.role !== 'admin') {
        window.location.href = '/';
      } else {
        setUser(savedUser);
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('thx_token');
    window.location.href = '/';
  }, []);

  const toastTimeoutRef = React.useRef(null);

  const showToast = React.useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!user) return null; // Wait for auth check

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row font-sans selection:bg-black selection:text-white">
      {/* Dynamic Toast Alert (Red for Error, Emerald for Success) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
          <div className={`${
            toastType === 'error' ? 'bg-red-600 border-red-700' : 'bg-emerald-600 border-emerald-700'
          } text-white px-5 py-3.5 rounded-none shadow-xl flex items-center gap-3 font-medium border`}>
            {toastType === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black text-white flex flex-col min-h-[auto] md:min-h-screen shrink-0 border-r border-neutral-900">
        <div className="p-6 border-b border-neutral-900 flex flex-col items-center justify-center text-center">
          <img 
            src="/logo-transparent.png" 
            alt="GETRAW Logo" 
            className="h-9 w-auto object-contain filter invert opacity-95 mb-3" 
          />
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] border border-neutral-800 px-3 py-1 bg-neutral-900/50">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            type="button"
            onClick={() => setActiveTab('pesanan')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-xs rounded-none transition-colors ${
              activeTab === 'pesanan'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            Pesanan
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pendapatan')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-xs rounded-none transition-colors ${
              activeTab === 'pendapatan'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            Pendapatan
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('produk')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-xs rounded-none transition-colors ${
              activeTab === 'produk'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Package className="w-4 h-4 stroke-[2.5]" />
            Produk
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pelanggan')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-xs rounded-none transition-colors ${
              activeTab === 'pelanggan'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 stroke-[2.5]" />
            Pelanggan
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pengaturan')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-xs rounded-none transition-colors ${
              activeTab === 'pengaturan'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
            Pengaturan
          </button>
        </nav>

        <div className="p-5 border-t border-neutral-900 bg-neutral-950/50">
          <div className="mb-4 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            Login sebagai: <br />
            <span className="text-white font-bold tracking-normal">{user.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-red-900 text-white transition-colors uppercase tracking-widest text-[10px] font-bold rounded-none border border-neutral-800"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-neutral-200 pb-5 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-1.5 text-black">
                {activeTab === 'pesanan' && 'Manajemen Pesanan'}
                {activeTab === 'pendapatan' && 'Pendapatan & Analisis'}
                {activeTab === 'produk' && 'Manajemen Produk'}
                {activeTab === 'pelanggan' && 'Manajemen Pelanggan'}
                {activeTab === 'pengaturan' && 'Pengaturan Sistem'}
              </h2>
              <p className="text-neutral-500 text-sm font-medium">
                {activeTab === 'pesanan' && 'Kelola daftar pesanan masuk, resi pengiriman, dan status order.'}
                {activeTab === 'pendapatan' && 'Ringkasan pemasukan real-time, statistik transaksi sukses, dan riwayat pesanan.'}
                {activeTab === 'produk' && 'Kelola katalog produk, harga, dan ketersediaan stok.'}
                {activeTab === 'pelanggan' && 'Kelola daftar pelanggan dan aktivitas akun.'}
                {activeTab === 'pengaturan' && 'Konfigurasi toko dan kredensial administrasi.'}
              </p>
            </div>
            <a 
              href="/" 
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black text-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-none shrink-0"
            >
              <Store className="w-4 h-4" />
              Lihat Toko
            </a>
          </header>

          {activeTab === 'pesanan' && (
            <OrderList 
              onError={(msg) => showToast(msg, 'error')}
              onSuccessToast={(msg) => showToast(msg, 'success')}
            />
          )}

          {activeTab === 'pendapatan' && (
            <RevenueDashboard 
              onError={(msg) => showToast(msg, 'error')}
              onSuccessToast={(msg) => showToast(msg, 'success')}
            />
          )}

          {activeTab === 'produk' && (
            <ProductTable 
              onError={(msg) => showToast(msg, 'error')}
              onSuccessToast={(msg) => showToast(msg, 'success')}
            />
          )}

          {activeTab === 'pelanggan' && (
            <CustomerList
              onError={(msg) => showToast(msg, 'error')}
              onSuccessToast={(msg) => showToast(msg, 'success')}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsForm
              onError={(msg) => showToast(msg, 'error')}
              onSuccessToast={(msg) => showToast(msg, 'success')}
            />
          )}
        </div>
      </main>
    </div>
  );
};
