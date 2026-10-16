import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { X, Upload, Loader2 } from 'lucide-react';

const CATEGORIES = ['Tees', 'Shirts', 'Outerwear', 'Sweaters', 'Pants', 'Accessories', 'Headwear'];
const SIZES_LIST = ['S', 'M', 'L', 'XL', '8', '30', '32', '34', '36'];

export const ProductFormModal = ({ isOpen, onClose, onSuccess, onError, initialData = null }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tees',
    price: '',
    discount: 0,
  });
  const [sizes, setSizes] = useState(
    SIZES_LIST.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.title || '',
        category: initialData.category || 'Tees',
        price: initialData.originalPrice !== undefined ? initialData.originalPrice : (initialData.price || ''),
        discount: initialData.discountPercentage !== undefined ? initialData.discountPercentage : (initialData.discountPercent || 0),
      });
      setImagePreview(initialData.image ? getImageUrl(initialData.image) : null);
      if (initialData.stockPerSize && typeof initialData.stockPerSize === 'object') {
        setSizes({ ...SIZES_LIST.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}), ...initialData.stockPerSize });
      } else if (Array.isArray(initialData.sizes)) {
        const fallbackStock = SIZES_LIST.reduce((acc, size) => ({ ...acc, [size]: initialData.sizes.includes(size) ? 3 : 0 }), {});
        setSizes(fallbackStock);
      }
    } else {
      setFormData({ name: '', category: 'Tees', price: '', discount: 0 });
      setImagePreview(null);
      setImageFile(null);
      setSizes(SIZES_LIST.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
    }
  }, [initialData, isOpen]);

  const numPrice = Number(formData.price) || 0;
  const numDiscount = Number(formData.discount) || 0;
  const finalPrice = Math.max(0, numPrice - (numPrice * numDiscount) / 100);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSizeChange = (size, value) => {
    setSizes(prev => ({ ...prev, [size]: Math.max(0, parseInt(value, 10) || 0) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('thx_token');
      
      const payload = new FormData();
      if (imageFile) {
        payload.append('image', imageFile);
      }
      payload.append('title', formData.name); 
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('originalPrice', Number(formData.price) || 0);
      payload.append('discountPercentage', Number(formData.discount) || 0);
      payload.append('sizes', JSON.stringify(sizes));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      };

      if (initialData && initialData.id) {
        await api.put(`/products/${initialData.id}`, payload, config);
      } else {
        await api.post('/products', payload, config);
      }
      onSuccess();
    } catch (err) {
      onError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-black w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-black hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
            {initialData ? 'EDIT PRODUK' : 'TAMBAH PRODUK BARU'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Foto Produk</label>
              <div className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-black transition-colors relative group min-h-[160px] flex items-center justify-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-40 w-auto object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 group-hover:text-black">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Drag & drop atau klik untuk upload</span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Nama Produk</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 p-2.5 focus:border-black focus:outline-none text-sm rounded-none transition-colors"
                  placeholder="Contoh: Tshirt Marzia"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Kategori</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 p-2.5 focus:border-black focus:outline-none text-sm rounded-none transition-colors"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Harga Normal (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 p-2.5 focus:border-black focus:outline-none text-sm rounded-none transition-colors"
                  placeholder="Contoh: 200000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Diskon (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 p-2.5 focus:border-black focus:outline-none text-sm rounded-none transition-colors"
                />
              </div>
            </div>
            
            <div className="bg-neutral-100 p-3 flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500 uppercase">Simulasi Harga Akhir:</span>
              <span className="font-black text-lg">Rp {finalPrice.toLocaleString('id-ID')}</span>
            </div>

            {/* Stock Management */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-3">Manajemen Stok per Ukuran</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {SIZES_LIST.map(size => (
                  <div key={size} className="flex flex-col">
                    <label className="text-xs font-bold text-center bg-black text-white py-1">{size}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={sizes[size]}
                      onChange={(e) => handleSizeChange(size, e.target.value)}
                      className="border border-neutral-200 bg-neutral-50 border-t-0 p-1.5 text-center text-sm focus:border-black focus:outline-none rounded-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-xs rounded-none border border-black"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PRODUK'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
