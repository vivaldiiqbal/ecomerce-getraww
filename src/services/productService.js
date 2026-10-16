import { ProductRepository } from '../repositories/productRepository.js';

export class ProductService {
  static getFilteredProducts(params) {
    return ProductRepository.findFiltered(params);
  }

  static getProductByIdAndSlug(id, slug) {
    return ProductRepository.findByIdAndSlug(id, slug);
  }

  static getProductById(id) {
    return ProductRepository.findById(id);
  }

  static createProduct(payload) {
    return ProductRepository.create(payload);
  }

  static updateProduct(id, payload) {
    return ProductRepository.update(id, payload);
  }

  static deleteProduct(id) {
    return ProductRepository.deleteById(id);
  }
}
