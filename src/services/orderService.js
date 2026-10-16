import { ProductRepository } from '../repositories/productRepository.js';
import { OrderRepository } from '../repositories/orderRepository.js';

export class OrderService {
  /**
   * Calculates subtotal, discounts, and shipping cost server-side
   */
  static calculateCheckout({ items, promoCode, shippingMethod }) {
    let subtotalOriginal = 0;
    let subtotalFinal = 0;
    const itemBreakdown = [];

    for (const item of items) {
      const product = ProductRepository.findById(item.id);
      if (!product) {
        const err = new Error(`Produk dengan ID "${item.id}" tidak ditemukan.`);
        err.statusCode = 404;
        throw err;
      }

      const availableStock = Math.max(0, Number(product.stockPerSize?.[item.size]) || 0);
      const qty = Math.max(1, Number(item.quantity) || 1);
      if (availableStock < qty) {
        const err = new Error(`Stok untuk ${product.title} (Size ${item.size}) tidak mencukupi. Tersisa ${availableStock} pcs.`);
        err.statusCode = 400;
        throw err;
      }

      const originalPrice = Number(product.originalPrice) || 0;
      const finalPrice = Number(product.finalPrice ?? product.price ?? 0);
      const itemOrigTotal = originalPrice * qty;
      const itemFinalTotal = finalPrice * qty;

      subtotalOriginal += itemOrigTotal;
      subtotalFinal += itemFinalTotal;

      itemBreakdown.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        size: item.size,
        quantity: qty,
        originalPrice,
        finalPrice,
        discountPercentage: Number(product.discountPercentage) || 0,
        itemTotal: itemFinalTotal,
        image: product.image
      });
    }

    let couponDiscount = 0;
    let isFreeShipping = false;

    if (promoCode) {
      const cleanCode = promoCode.trim().toUpperCase();
      if (cleanCode === 'INSOMNIA50' || cleanCode === 'GETRAW50') {
        couponDiscount = 50000;
      } else if (cleanCode === 'FREESHIP') {
        isFreeShipping = true;
      } else if (cleanCode === 'STREET10') {
        couponDiscount = Math.round((subtotalFinal * 10) / 100);
      }
    }

    if (subtotalFinal >= 300000) {
      isFreeShipping = true;
    }

    let shippingCost = 12000; // JNE REG default
    if (shippingMethod === 'express') shippingCost = 24000;
    if (shippingMethod === 'pickup' || isFreeShipping) shippingCost = 0;

    const discountAmount = (subtotalOriginal - subtotalFinal) + couponDiscount;
    const grandTotal = Math.max(0, subtotalFinal - couponDiscount) + shippingCost;

    return {
      subtotalOriginal,
      subtotalFinal,
      couponDiscount,
      totalSavings: discountAmount,
      shippingCost,
      isFreeShipping,
      grandTotal,
      currency: "IDR",
      items: itemBreakdown
    };
  }

  /**
   * Places order with atomic in-memory stock deduction and creates order record
   */
  static checkout({ items, customer, paymentMethod, shippingMethod, promoCode }) {
    // 1. Calculate totals
    const calc = this.calculateCheckout({ items, promoCode, shippingMethod });

    // 2. Perform Atomic In-Memory Stock Deduction
    for (const item of items) {
      ProductRepository.deductStockAtomic(item.id, item.size, item.quantity);
    }

    // 3. Create Order in Repository
    const orderNumber = OrderRepository.generateOrderNumber();
    const newOrder = OrderRepository.create({
      orderNumber,
      customer,
      items: calc.items,
      subtotalOriginal: calc.subtotalOriginal,
      subtotalFinal: calc.subtotalFinal,
      discount: calc.couponDiscount,
      shippingCost: calc.shippingCost,
      grandTotal: calc.grandTotal,
      paymentMethod: paymentMethod || 'QRIS INSTANT',
      paymentStatus: 'UNPAID'
    });

    return newOrder;
  }

  /**
   * Simulates payment confirmation to change order status to QRIS INSTANT LUNAS
   */
  static simulatePayment(orderNumber) {
    const updatedOrder = OrderRepository.updatePaymentStatus(orderNumber, 'QRIS INSTANT LUNAS');
    return updatedOrder;
  }

  /**
   * Retrieves single order by orderNumber for order tracking
   */
  static getOrderByNumber(orderNumber) {
    return OrderRepository.findByOrderNumber(orderNumber);
  }

  /**
   * Retrieves all orders for admin
   */
  static getAllOrders() {
    return OrderRepository.findAll();
  }
}

