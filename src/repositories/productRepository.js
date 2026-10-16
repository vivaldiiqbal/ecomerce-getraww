import { BaseRepository } from './baseRepository.js';

export class ProductRepository {
  /**
   * Retrieves all products from in-memory cache
   */
  static findAll() {
    return BaseRepository.dbData.products;
  }

  /**
   * Finds product by ID and Slug
   */
  static findByIdAndSlug(id, slug) {
    return BaseRepository.dbData.products.find(p => p.id === String(id) && p.slug === slug);
  }

  /**
   * Finds product by ID
   */
  static findById(id) {
    return BaseRepository.dbData.products.find(p => p.id === String(id));
  }

  /**
   * Filters & Paginates products matching FILTER STREETWEAR drawer specifications
   */
  static findFiltered(params) {
    const {
      q,
      categories,
      productType,
      availability,
      priceRange,
      size,
      sortBy,
      page = 1,
      limit = 100
    } = params;

    const allProducts = BaseRepository.dbData.products;

    // Pre-calculate filter predicates for high performance
    const queryStr = q ? q.toLowerCase().trim() : null;
    
    let categoriesSet = null;
    if (Array.isArray(categories) && categories.length > 0) {
      categoriesSet = new Set(categories);
    } else if (typeof categories === 'string' && categories.trim()) {
      categoriesSet = new Set(categories.split(',').map(c => c.trim()));
    }

    const normalizedPriceRange = (priceRange || '').replace(/-/g, '_');
    const isDiscountOnly = productType === 'discount';
    const isStockOnly = availability === 'in_stock' || availability === 'in-stock';

    // Single unified filter pass O(N)
    const filtered = allProducts.filter(p => {
      if (!p) return false;

      // 1. Search Query
      if (queryStr) {
        const matchesTitle = p.title && p.title.toLowerCase().includes(queryStr);
        const matchesDesc = p.description && p.description.toLowerCase().includes(queryStr);
        const matchesCat = p.category && p.category.toLowerCase().includes(queryStr);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // 2. Categories
      if (categoriesSet && !categoriesSet.has(p.category)) {
        return false;
      }

      // 3. Product Type (Discount)
      if (isDiscountOnly && !(Number(p.discountPercentage) > 0 || p.discount !== null)) {
        return false;
      }

      // 4. Availability
      if (isStockOnly && p.inStock !== true) {
        return false;
      }

      // 5. Price Range
      const finalPrice = Number(p.finalPrice ?? p.price ?? 0);
      if (normalizedPriceRange === 'under_230k' && finalPrice >= 230000) return false;
      if (normalizedPriceRange === '230k_420k' && (finalPrice < 230000 || finalPrice > 420000)) return false;
      if (normalizedPriceRange === '420k_610k' && (finalPrice <= 420000 || finalPrice > 610000)) return false;
      if (normalizedPriceRange === 'above_610k' && finalPrice <= 610000) return false;

      // 6. Size (Check stockPerSize > 0)
      if (size && (!p.stockPerSize || (Number(p.stockPerSize[size]) || 0) <= 0)) {
        return false;
      }

      return true;
    });

    // 7. Sorting
    const normalizedSortBy = (sortBy || '').replace(/-/g, '_');
    if (normalizedSortBy === 'price_asc') {
      filtered.sort((a, b) => Number(a.finalPrice ?? a.price ?? 0) - Number(b.finalPrice ?? b.price ?? 0));
    } else if (normalizedSortBy === 'price_desc') {
      filtered.sort((a, b) => Number(b.finalPrice ?? b.price ?? 0) - Number(a.finalPrice ?? a.price ?? 0));
    } else if (normalizedSortBy === 'newest') {
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    // 8. Pagination
    const numLimit = Math.max(1, Number(limit) || 100);
    const numPage = Math.max(1, Number(page) || 1);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / numLimit) || 1;
    const currentPage = Math.min(numPage, totalPages);
    const startIndex = (currentPage - 1) * numLimit;
    const paginatedItems = filtered.slice(startIndex, startIndex + numLimit);

    return {
      metadata: {
        totalItems,
        totalPages,
        currentPage,
        perPage: numLimit,
        searchQuery: q || null,
        appliedFilters: {
          categories: categories || 'all',
          productType: productType || 'all',
          availability: availability || 'all',
          priceRange: priceRange || 'all',
          size: size || null
        }
      },
      data: paginatedItems
    };
  }

  /**
   * ATOMIC STOCK CHECK & DEDUCTION (Anti-Negative Stock)
   * Prevents stock from dropping below 0 in memory.
   */
  static deductStockAtomic(id, size, quantity) {
    const product = this.findById(id);
    if (!product) {
      throw new Error(`Produk dengan ID "${id}" tidak ditemukan.`);
    }

    if (!product.stockPerSize || typeof product.stockPerSize[size] === 'undefined') {
      throw new Error(`Ukuran "${size}" tidak tersedia untuk produk ${product.title}.`);
    }

    const currentStock = Math.max(0, Number(product.stockPerSize[size]) || 0);
    const deductQty = Math.max(1, Number(quantity) || 1);
    if (currentStock < deductQty) {
      throw new Error(`Stok untuk ${product.title} (Size ${size}) tidak mencukupi. Tersisa ${currentStock} pcs.`);
    }

    // Synchronous memory mutation with strictly numeric subtraction
    product.stockPerSize[size] = currentStock - deductQty;
    
    // Check total remaining stock across all sizes
    const totalRemaining = Object.values(product.stockPerSize).reduce((sum, val) => sum + (Number(val) || 0), 0);
    if (totalRemaining <= 0) {
      product.inStock = false;
    }

    // Persist changes
    BaseRepository.saveSync();
    return product;
  }

  /**
   * Creates a new product in memory and persists to db.json
   */
  static create(payload) {
    const id = payload.id || String(Math.floor(100000 + Math.random() * 900000));
    const title = payload.title || payload.name || 'Produk Baru';
    const slug = payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const rawStock = payload.stockPerSize && typeof payload.stockPerSize === 'object' ? payload.stockPerSize : {};
    const stockPerSize = {};
    for (const [s, q] of Object.entries(rawStock)) {
      stockPerSize[s] = Math.max(0, Number(q) || 0);
    }
    const totalStock = Object.values(stockPerSize).reduce((acc, val) => acc + val, 0);
    const sizes = Object.keys(stockPerSize).filter(s => stockPerSize[s] > 0);
    
    const originalPrice = Number(payload.originalPrice) || 0;
    const discountPercentage = Number(payload.discountPercentage) || 0;
    const finalPrice = payload.finalPrice !== undefined && payload.finalPrice !== null && payload.finalPrice !== ''
      ? Number(payload.finalPrice)
      : Math.max(0, originalPrice - Math.round(originalPrice * (discountPercentage / 100)));

    const newProduct = {
      id,
      title,
      slug,
      category: payload.category || 'Tees',
      originalPrice,
      discountPercentage,
      finalPrice,
      discount: discountPercentage > 0 ? `${discountPercentage}%` : null,
      image: payload.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      hoverImage: payload.hoverImage || payload.image || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      sizes,
      stockPerSize,
      inStock: totalStock > 0,
      description: payload.description || 'Apparel streetwear premium GETRAW.',
      fabric: payload.fabric || '100% Premium Cotton',
      isNew: payload.isNew !== undefined ? Boolean(payload.isNew) : true,
      createdAt: new Date().toISOString()
    };

    BaseRepository.dbData.products.unshift(newProduct);
    BaseRepository.saveSync();
    return newProduct;
  }

  /**
   * Updates existing product in memory and persists to db.json
   */
  static update(id, payload) {
    const index = BaseRepository.dbData.products.findIndex(p => p.id === String(id));
    if (index === -1) return null;

    const existing = BaseRepository.dbData.products[index];
    
    const title = payload.title || payload.name || existing.title;
    const slug = payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const rawStock = payload.stockPerSize && typeof payload.stockPerSize === 'object' ? payload.stockPerSize : existing.stockPerSize;
    const stockPerSize = {};
    for (const [s, q] of Object.entries(rawStock || {})) {
      stockPerSize[s] = Math.max(0, Number(q) || 0);
    }
    const totalStock = Object.values(stockPerSize).reduce((acc, val) => acc + val, 0);
    const sizes = Object.keys(stockPerSize).filter(s => stockPerSize[s] > 0);

    const originalPrice = payload.originalPrice !== undefined ? Number(payload.originalPrice) : existing.originalPrice;
    const discountPercentage = payload.discountPercentage !== undefined ? Number(payload.discountPercentage) : existing.discountPercentage;
    const finalPrice = payload.finalPrice !== undefined && payload.finalPrice !== null && payload.finalPrice !== ''
      ? Number(payload.finalPrice)
      : Math.max(0, originalPrice - Math.round(originalPrice * (discountPercentage / 100)));

    const updatedProduct = {
      ...existing,
      title,
      slug,
      category: payload.category || existing.category,
      originalPrice,
      discountPercentage,
      finalPrice,
      discount: discountPercentage > 0 ? `${discountPercentage}%` : null,
      image: payload.image || existing.image,
      hoverImage: payload.hoverImage || payload.image || existing.hoverImage,
      sizes,
      stockPerSize,
      inStock: totalStock > 0,
      description: payload.description || existing.description,
      fabric: payload.fabric || existing.fabric,
      updatedAt: new Date().toISOString()
    };

    BaseRepository.dbData.products[index] = updatedProduct;
    BaseRepository.saveSync();
    return updatedProduct;
  }

  /**
   * Deletes product by ID from memory and db.json
   */
  static deleteById(id) {
    const index = BaseRepository.dbData.products.findIndex(p => p.id === String(id));
    if (index === -1) return false;

    BaseRepository.dbData.products.splice(index, 1);
    BaseRepository.saveSync();
    return true;
  }
}
