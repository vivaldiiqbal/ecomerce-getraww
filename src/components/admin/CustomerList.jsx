import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { Trash2, Loader2, Search } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const CustomerList = ({ onError, onSuccessToast }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      setCustomers(res.data.data || []);
    } catch {
      onError?.('Gagal memuat daftar pelanggan.');
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeleteClick = useCallback((id, name) => {
    setCustomerToDelete({ id, name });
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!customerToDelete) return;
    const target = { ...customerToDelete };
    setIsConfirmOpen(false);
    setCustomerToDelete(null);

    try {
      await api.delete(`/users/${target.id}`);
      setCustomers(prev => prev.filter(c => c.id !== target.id));
      onSuccessToast?.(`Pelanggan ${target.name} berhasil dihapus.`);
      fetchCustomers();
    } catch {
      onError?.('Gagal menghapus pelanggan.');
    }
  }, [customerToDelete, onSuccessToast, fetchCustomers, onError]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c => 
      (c.name || '').toLowerCase().includes(q) || 
      (c.email || '').toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  return (
    <div className="bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200 rounded-none animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari pelanggan berdasarkan nama/email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 text-sm focus:border-black focus:outline-none rounded-none transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-black text-[11px] uppercase tracking-wider text-neutral-500 bg-white">
              <th className="py-4 px-4 font-black text-black">Nama Pelanggan</th>
              <th className="py-4 px-4 font-black text-black">Email</th>
              <th className="py-4 px-4 font-black text-black">Nomor WhatsApp</th>
              <th className="py-4 px-4 font-black text-black">Tanggal Bergabung</th>
              <th className="py-4 px-4 font-black text-center text-black">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500 font-medium">
                  Tidak ada pelanggan ditemukan.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-sm">{customer.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="py-3 px-4 text-sm font-mono">{customer.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleDeleteClick(customer.id, customer.name)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus Akun Pelanggan"
        message={`Apakah Anda yakin ingin menghapus akun pelanggan "${customerToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pelanggan"
        cancelText="Batal"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
};
