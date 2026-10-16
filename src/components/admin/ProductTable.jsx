import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { Pencil, Trash, Plus, Loader2, Search } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const ProductTable = ({ onError, onSuccessToast }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProducts = React.useCallback(async () => {
    try {
      if (isMountedRef.current) setIsLoading(true);
      const res = await api.get('/products');
      if (isMountedRef.current) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errMsg = err.response?.data?.message || err.message || 'Gagal memuat daftar produk.';
        onError?.(errMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [onError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddClick = React.useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleEditClick = React.useCallback((product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((id, name) => {
    setProductToDelete({ id, name });
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!productToDelete) return;

    const targetProduct = { ...productToDelete };
    setIsConfirmOpen(false);
    setProductToDelete(null);

    try {
      await api.delete(`/products/${targetProduct.id}`);
      setProducts(prev => prev.filter(p => p.id !== targetProduct.id));
      onSuccessToast?.(`Produk ${targetProduct.name} berhasil dihapus.`);
      fetchProducts();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus produk.';
      if (isMountedRef.current) {
        onError?.(errMsg);
      }
    }
  }, [productToDelete, onSuccessToast, fetchProducts, onError]);

  const handleModalSuccess = React.useCallback(() => {
    setIsModalOpen(false);
    onSuccessToast(editingProduct ? 'Produk berhasil diubah.' : 'Produk berhasil ditambahkan.');
    fetchProducts();
  }, [editingProduct, onSuccessToast, fetchProducts]);

  const filteredProducts = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => 
      (p.title || p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div className="bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200 rounded-none">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari produk..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 text-sm focus:border-black focus:outline-none rounded-none transition-colors"
          />
        </div>
        <button 
          onClick={handleAddClick}
          className="w-full sm:w-auto bg-black text-white px-6 py-3 font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-neutral-800 transition-colors rounded-none"
        >
          <Plus className="w-4 h-4 mr-2 stroke-[2.5]" />
          TAMBAH PRODUK BARU
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-black text-[11px] uppercase tracking-wider text-neutral-500 bg-white">
              <th className="py-4 px-4 font-black w-24 text-black">Foto</th>
              <th className="py-4 px-4 font-black text-black">Nama Produk</th>
              <th className="py-4 px-4 font-black text-black">Kategori</th>
              <th className="py-4 px-4 font-black text-black">Harga Akhir</th>
              <th className="py-4 px-4 font-black text-black">Stok Total</th>
              <th className="py-4 px-4 font-black text-center text-black">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const finalPrice = product.finalPrice !== undefined 
                  ? product.finalPrice 
                  : Math.max(0, (product.originalPrice || 0) - ((product.originalPrice || 0) * (product.discountPercentage || 0)) / 100);
                
                const sizesObj = product.stockPerSize || {};
                const totalStock = Object.values(sizesObj).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
                
                const imageUrl = getImageUrl(product.image);

                return (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <img 
                        src={imageUrl} 
                        alt={product.title} 
                        className="w-12 h-12 object-cover bg-gray-100 border border-gray-200"
                        onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+'; }} 
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-sm">{product.title || product.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 text-sm font-bold">Rp {finalPrice.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-sm font-mono">{totalStock}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 transition-colors rounded-sm"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product.id, product.title || product.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                          title="Hapus"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        onError={onError}
        initialData={editingProduct}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};
