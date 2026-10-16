import React, { useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, PackageSearch, X, ArrowUpDown } from 'lucide-react';

export const ProductGrid = () => {
  const { products, isLoadingProducts, filters, setFilters, resetAllFilters, toggleDrawer } = useShop();

  // Defensive Filter Processing using useMemo & Optional Chaining
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter(product => {
      // 1. Category check with optional chaining
      const matchCat = !filters?.categories?.length || filters?.categories?.includes(product?.category);

      // 2. Product type check
      let matchType = true;
      if (filters?.productType === 'discount') {
        matchType = product?.discount !== null;
      }

      // 3. Availability check
      let matchAvail = true;
      if (filters?.availability === 'in-stock') {
        matchAvail = product?.inStock === true;
      }

      // 4. Price range check
      let matchPrice = true;
      const price = product?.finalPrice ?? product?.price ?? 0;
      if (filters?.priceRange === 'under-230k') {
        matchPrice = price < 230000;
      } else if (filters?.priceRange === '230k-420k') {
        matchPrice = price >= 230000 && price <= 420000;
      } else if (filters?.priceRange === '420k-610k') {
        matchPrice = price > 420000 && price <= 610000;
      } else if (filters?.priceRange === 'above-610k') {
        matchPrice = price > 610000;
      }

      // 5. Size check with optional chaining (item?.sizes?.includes(selectedSize))
      let matchSize = true;
      if (filters?.selectedSize) {
        matchSize = product?.sizes?.includes(filters.selectedSize) ?? false;
      }

      // 6. Search query
      let matchSearch = true;
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        matchSearch = (product?.title?.toLowerCase()?.includes(q) ?? false) ||
                      (product?.category?.toLowerCase()?.includes(q) ?? false);
      }

      return matchCat && matchType && matchAvail && matchPrice && matchSize && matchSearch;
    });
  }, [products, filters]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (filters?.sortBy === 'price-asc') {
      list.sort((a, b) => (a?.finalPrice ?? a?.price ?? 0) - (b?.finalPrice ?? b?.price ?? 0));
    } else if (filters?.sortBy === 'price-desc') {
      list.sort((a, b) => (b?.finalPrice ?? b?.price ?? 0) - (a?.finalPrice ?? a?.price ?? 0));
    } else if (filters?.sortBy === 'newest') {
      list.sort((a, b) => (b?.isNew ? 1 : 0) - (a?.isNew ? 1 : 0));
    }
    return list;
  }, [filteredProducts, filters?.sortBy]);

  // Dynamic Header Title (Matching Screenshot 3)
  const catalogTitle = useMemo(() => {
    if (filters?.searchQuery) {
      return `"${filters.searchQuery}"`;
    } else if (filters?.productType === 'discount') {
      return `"Special Discount 50%"`;
    } else if (filters?.selectedSize) {
      return `"Size ${filters.selectedSize}"`;
    } else if (filters?.categories?.length === 1) {
      return `"${filters.categories[0]}"`;
    }
    return "All Products";
  }, [filters]);

  return (
    <section className="flex-1">
      {/* Mobile Filter & Count Bar */}
      <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
        <button
          onClick={() => toggleDrawer('filter', true)}
          className="flex items-center space-x-2 px-4 py-2 border border-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter & Kategori</span>
        </button>
        <span className="text-xs text-neutral-500 font-medium">
          {sortedProducts.length} Produk ditemukan
        </span>
      </div>

      {/* Catalog Title Header */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
          Catalog Store
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
          {catalogTitle}
        </h2>
      </div>

      {/* Active Filter Pills Indicator */}
      {(filters?.selectedSize || filters?.productType !== 'all' || filters?.priceRange !== 'all' || filters?.searchQuery) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Filter Aktif:</span>
          
          {filters?.searchQuery && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-neutral-100 text-neutral-900 text-[11px] font-bold border border-neutral-300">
              <span>Cari: "{filters.searchQuery}"</span>
              <button onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters?.productType === 'discount' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-black text-white text-[11px] font-bold">
              <span>Discount 50%</span>
              <button onClick={() => setFilters(prev => ({ ...prev, productType: 'all' }))} className="hover:text-neutral-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters?.selectedSize && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-neutral-100 text-neutral-900 text-[11px] font-bold border border-neutral-300">
              <span>Size: {filters.selectedSize}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, selectedSize: null }))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-[11px] text-neutral-500 hover:text-black underline font-semibold ml-2"
          >
            Hapus Semua
          </button>
        </div>
      )}

      {/* Sorting bar */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100 text-xs">
        <span className="text-neutral-500 font-medium hidden sm:inline-block">
          Memuat <strong>{sortedProducts.length}</strong> produk
        </span>
        <div className="flex items-center space-x-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-700">Urutkan:</span>
          <select
            value={filters?.sortBy || 'featured'}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Harga: Rendah ke Tinggi</option>
            <option value="price-desc">Harga: Tinggi ke Rendah</option>
            <option value="newest">Rilis Terbaru</option>
          </select>
        </div>
      </div>

      {/* 4-Column Responsive Full-Width Product Grid */}
      {isLoadingProducts ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="w-full aspect-[3/4] bg-neutral-200"></div>
              <div className="w-2/3 h-4 bg-neutral-200"></div>
              <div className="w-1/2 h-4 bg-neutral-200"></div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 border border-dashed border-neutral-300 bg-neutral-50 p-8">
          <PackageSearch className="w-12 h-12 mx-auto text-neutral-400 mb-3 stroke-1" />
          <h3 className="text-base font-bold text-neutral-800">Katalog Produk Masih Kosong</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Semua produk contoh telah dihapus. Anda dapat memasukkan data produk Anda sendiri ke dalam katalog.
          </p>
          {(filters?.selectedSize || filters?.productType !== 'all' || filters?.searchQuery) && (
            <button
              onClick={resetAllFilters}
              className="mt-5 px-6 py-2.5 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </section>
  );
};
