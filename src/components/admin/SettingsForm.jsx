import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, Save } from 'lucide-react';

export const SettingsForm = ({ onError, onSuccessToast }) => {
  const [settings, setSettings] = useState({
    storeName: '',
    whatsappNumber: '',
    flatShippingRate: ''
  });
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/settings');
      setSettings(res.data.data);
    } catch {
      onError?.('Gagal memuat pengaturan toko.');
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...settings,
        flatShippingRate: Number(settings.flatShippingRate) || 0,
        newAdminPassword: newAdminPassword
      };
      await api.put('/settings', payload);
      onSuccessToast?.('Pengaturan berhasil disimpan.');
      setNewAdminPassword('');
    } catch {
      onError?.('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  }, [settings, newAdminPassword, onSuccessToast, onError]);

  if (isLoading) {
    return (
      <div className="bg-white p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200 rounded-none flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-neutral-500" />
        <span className="text-neutral-500">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200 rounded-none animate-fade-in max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Pengaturan Toko */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider mb-4 pb-2 border-b-2 border-black text-black">
            Pengaturan Toko
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">Nama Toko</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full border border-neutral-300 p-2.5 bg-neutral-50 text-sm focus:border-black focus:outline-none focus:bg-white transition-colors"
                placeholder="GETRAW"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">Nomor WhatsApp Toko</label>
              <input
                type="tel"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full border border-neutral-300 p-2.5 bg-neutral-50 text-sm focus:border-black focus:outline-none focus:bg-white transition-colors"
                placeholder="0812..."
              />
              <p className="text-[10px] text-neutral-500 mt-1">Gunakan format 08xx atau 628xx</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">Ongkos Kirim Default (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.flatShippingRate}
                onChange={(e) => setSettings({ ...settings, flatShippingRate: e.target.value })}
                className="w-full border border-neutral-300 p-2.5 bg-neutral-50 text-sm focus:border-black focus:outline-none focus:bg-white transition-colors"
              />
              <p className="text-[10px] text-neutral-500 mt-1">Biaya pengiriman rata-rata yang ditagihkan saat pelanggan checkout</p>
            </div>
          </div>
        </div>

        {/* Pengaturan Admin */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider mb-4 pb-2 border-b-2 border-black text-black mt-8">
            Pengaturan Admin
          </h3>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">Ubah Kata Sandi Admin Baru</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full border border-neutral-300 p-2.5 bg-neutral-50 text-sm focus:border-black focus:outline-none focus:bg-white transition-colors"
                placeholder="Biarkan kosong jika tidak ingin mengubah password"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-neutral-200">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-black text-white px-8 py-3.5 font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-neutral-800 transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                MENYIMPAN...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                SIMPAN PENGATURAN
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
