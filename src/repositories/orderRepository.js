import { BaseRepository } from './baseRepository.js';

export class OrderRepository {
  /**
   * Generates unique order number with format #THX-YYYYMMDD-XXX (e.g., #THX-20261008-882)
   */
  static generateOrderNumber() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomSeq = Math.floor(100 + Math.random() * 900); // 3-digit sequence
    return `#THX-${yyyy}${mm}${dd}-${randomSeq}`;
  }

  static findByOrderNumber(orderNumber) {
    if (!orderNumber) return null;
    const cleanNum = String(orderNumber).trim().replace(/^#+/, '').toUpperCase();
    return BaseRepository.dbData.orders.find(o => {
      const oNum = o.orderNumber ? String(o.orderNumber).trim().replace(/^#+/, '').toUpperCase() : '';
      const oId = o.id ? String(o.id).trim().replace(/^#+/, '').toUpperCase() : '';
      return oNum === cleanNum || oId === cleanNum;
    });
  }

  static create(orderPayload) {
    const newOrder = {
      orderNumber: orderPayload.orderNumber || this.generateOrderNumber(),
      date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      customer: orderPayload.customer,
      items: orderPayload.items,
      subtotalOriginal: Number(orderPayload.subtotalOriginal) || 0,
      subtotalFinal: Number(orderPayload.subtotalFinal) || 0,
      discount: Number(orderPayload.discount) || 0,
      shippingCost: Number(orderPayload.shippingCost) || 0,
      grandTotal: Number(orderPayload.grandTotal) || 0,
      paymentMethod: orderPayload.paymentMethod || 'QRIS INSTANT',
      paymentStatus: orderPayload.paymentStatus || 'UNPAID',
      orderStatus: orderPayload.orderStatus || 'PENDING',
      trackingNumber: orderPayload.trackingNumber || '',
      qrCodeData: orderPayload.qrCodeData || `00020101021126620014ID.LINKAJA.WWW01189360091438921020215202610085802ID5910GETRAW® KIOSK6007JAKARTA61051211062070703A0163045E1A`,
      virtualAccountNo: orderPayload.virtualAccountNo || `8820938472910384`,
      createdAt: new Date().toISOString()
    };

    BaseRepository.dbData.orders.push(newOrder);
    BaseRepository.saveSync();
    return newOrder;
  }

  static updatePaymentStatus(orderNumber, status = 'QRIS INSTANT LUNAS') {
    const order = this.findByOrderNumber(orderNumber);
    if (!order) {
      throw new Error(`Pesanan dengan Nomor Transaksi "${orderNumber}" tidak ditemukan.`);
    }

    order.paymentStatus = status;
    order.paidAt = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    BaseRepository.saveSync();
    return order;
  }

  static findAll() {
    return BaseRepository.dbData.orders;
  }

  static updateOrderStatus(orderNumber, { orderStatus, trackingNumber }) {
    const order = this.findByOrderNumber(orderNumber);
    if (!order) {
      throw new Error(`Pesanan dengan Nomor Transaksi "${orderNumber}" tidak ditemukan.`);
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    
    BaseRepository.saveSync();
    return order;
  }
}
