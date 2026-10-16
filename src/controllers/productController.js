import { asyncHandler } from '../utils/asyncHandler.js';
import { ProductService } from '../services/productService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class ProductController {
  /**
   * GET /api/v1/products
   * Serves catalog with query parameters matching FILTER STREETWEAR drawer
   */
  static getProducts = asyncHandler(async (req, res) => {
    const result = ProductService.getFilteredProducts(req.query);
    return successResponse(res, 200, 'Katalog produk berhasil dimuat.', result.data, result.metadata);
  });

  /**
   * GET /api/v1/products/:id/:slug
   * Serves product detail
   */
  static getProductByIdAndSlug = asyncHandler(async (req, res) => {
    const { id, slug } = req.params;
    const product = ProductService.getProductByIdAndSlug(id, slug);

    if (!product) {
      return errorResponse(res, 404, `Produk dengan ID "${id}" tidak ditemukan.`, 'NotFound');
    }

    return successResponse(res, 200, 'Detail produk berhasil dimuat.', product);
  });

  /**
   * POST /api/v1/products
   * Creates a new product (handles multipart image upload or URL)
   */
  static createProduct = asyncHandler(async (req, res) => {
    let stockPerSize = req.body.sizes;
    if (typeof stockPerSize === 'string') {
      try {
        stockPerSize = JSON.parse(stockPerSize);
      } catch {
        stockPerSize = {};
      }
    }

    if (stockPerSize && typeof stockPerSize === 'object') {
      const cleanStock = {};
      for (const [s, q] of Object.entries(stockPerSize)) {
        cleanStock[s] = Math.max(0, Number(q) || 0);
      }
      stockPerSize = cleanStock;
    }

    let image = req.body.image || '';
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    const originalPrice = Number(req.body.originalPrice) || Number(req.body.price) || 0;
    const discountPercentage = Number(req.body.discountPercentage) || Number(req.body.discount) || 0;
    const finalPrice = req.body.finalPrice !== undefined && req.body.finalPrice !== null && req.body.finalPrice !== ''
      ? Number(req.body.finalPrice)
      : Math.max(0, originalPrice - Math.round(originalPrice * (discountPercentage / 100)));

    const payload = {
      title: req.body.name || req.body.title,
      category: req.body.category,
      originalPrice,
      discountPercentage,
      finalPrice,
      stockPerSize: stockPerSize || {},
      image,
      description: req.body.description,
      fabric: req.body.fabric
    };

    if (!payload.title) {
      return errorResponse(res, 400, 'Nama produk wajib diisi.', 'ValidationError');
    }

    const newProduct = ProductService.createProduct(payload);
    return successResponse(res, 201, 'Produk berhasil ditambahkan ke katalog.', newProduct);
  });

  /**
   * PUT /api/v1/products/:id
   * Updates an existing product
   */
  static updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = ProductService.getProductById(id);
    if (!existing) {
      return errorResponse(res, 404, `Produk dengan ID "${id}" tidak ditemukan.`, 'NotFound');
    }

    let stockPerSize = req.body.sizes || req.body.stockPerSize;
    if (typeof stockPerSize === 'string') {
      try {
        stockPerSize = JSON.parse(stockPerSize);
      } catch {
        stockPerSize = undefined;
      }
    }

    if (stockPerSize && typeof stockPerSize === 'object') {
      const cleanStock = {};
      for (const [s, q] of Object.entries(stockPerSize)) {
        cleanStock[s] = Math.max(0, Number(q) || 0);
      }
      stockPerSize = cleanStock;
    }

    let image = req.body.image || existing.image;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    const originalPrice = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : (req.body.price !== undefined ? Number(req.body.price) : existing.originalPrice);
    const discountPercentage = req.body.discountPercentage !== undefined ? Number(req.body.discountPercentage) : (req.body.discount !== undefined ? Number(req.body.discount) : existing.discountPercentage);
    const finalPrice = req.body.finalPrice !== undefined && req.body.finalPrice !== null && req.body.finalPrice !== ''
      ? Number(req.body.finalPrice)
      : Math.max(0, originalPrice - Math.round(originalPrice * (discountPercentage / 100)));

    const payload = {
      title: req.body.name || req.body.title || existing.title,
      category: req.body.category || existing.category,
      originalPrice,
      discountPercentage,
      finalPrice,
      stockPerSize: stockPerSize !== undefined ? stockPerSize : existing.stockPerSize,
      image,
      description: req.body.description || existing.description,
      fabric: req.body.fabric || existing.fabric
    };

    const updated = ProductService.updateProduct(id, payload);
    return successResponse(res, 200, 'Data produk berhasil diperbarui.', updated);
  });

  /**
   * DELETE /api/v1/products/:id
   * Deletes a product by ID
   */
  static deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = ProductService.deleteProduct(id);

    if (!deleted) {
      return errorResponse(res, 404, `Produk dengan ID "${id}" tidak ditemukan.`, 'NotFound');
    }

    return successResponse(res, 200, 'Produk berhasil dihapus dari katalog.', { id });
  });
}
