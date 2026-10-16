import { asyncHandler } from '../utils/asyncHandler.js';
import { OrderService } from '../services/orderService.js';
import { OrderRepository } from '../repositories/orderRepository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export class OrderController {
  /**
   * POST /api/v1/orders/calculate
   */
  static calculateCheckout = asyncHandler(async (req, res) => {
    const calculation = OrderService.calculateCheckout(req.body);
    return successResponse(res, 200, 'Kalkulasi keranjang belanja & checkout berhasil.', calculation);
  });

  /**
   * POST /api/v1/orders/checkout
   */
  static checkout = asyncHandler(async (req, res) => {
    const newOrder = OrderService.checkout(req.body);
    return successResponse(res, 201, 'Pesanan berhasil dibuat. Silakan lakukan pembayaran QRIS/VA.', newOrder);
  });

  /**
   * GET /api/v1/orders/:orderNumber
   * Customer Order Tracking
   */
  static getOrderByNumber = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const order = OrderService.getOrderByNumber(orderNumber);
    if (!order) {
      return errorResponse(res, 404, `Pesanan dengan Nomor "${orderNumber}" tidak ditemukan.`, 'NotFound');
    }
    return successResponse(res, 200, 'Data pesanan berhasil ditemukan.', order);
  });

  /**
   * POST /api/v1/orders/:orderNumber/simulate-pay
   */
  static simulatePay = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const paidOrder = OrderService.simulatePayment(orderNumber);
    return successResponse(res, 200, 'Simulasi pembayaran berhasil. Status pesanan kini QRIS INSTANT LUNAS.', paidOrder);
  });

  /**
   * GET /api/v1/orders
   * Requires Admin
   */
  static getAllOrders = asyncHandler(async (req, res) => {
    return successResponse(res, 200, 'Berhasil mengambil data pesanan', OrderRepository.findAll());
  });

  /**
   * PUT /api/v1/orders/:id/status (or /orders/:orderNumber/status)
   * Requires Admin
   */
  static updateOrderStatus = asyncHandler(async (req, res) => {
    const rawTarget = req.params.id || req.params.orderNumber;
    const { status, orderStatus, trackingNumber } = req.body;
    
    const inputStatus = status || orderStatus;
    if (!inputStatus && trackingNumber === undefined) {
      return res.status(400).json({
        success: false,
        errorType: 'ValidationError',
        message: 'Parameter status atau nomor resi (trackingNumber) wajib disertakan.'
      });
    }

    // Normalisasi status pengiriman (mendukung kata kunci Indonesia atau bahasa Inggris)
    let normalizedStatus;
    if (inputStatus) {
      const upper = String(inputStatus).trim().toUpperCase();
      if (upper.includes('PROS') || upper === 'PROCESSING' || upper === 'DIPROSES') {
        normalizedStatus = 'PROCESSING';
      } else if (upper.includes('KIRIM') || upper === 'SHIPPED' || upper === 'DIKIRIM') {
        normalizedStatus = 'SHIPPED';
      } else if (upper.includes('SELESAI') || upper === 'DELIVERED') {
        normalizedStatus = 'DELIVERED';
      } else if (upper.includes('BATAL') || upper === 'CANCELLED' || upper === 'CANCELLED (BATAL)') {
        normalizedStatus = 'CANCELLED';
      } else if (upper.includes('PENDING') || upper === 'MENUNGGU') {
        normalizedStatus = 'PENDING';
      } else {
        normalizedStatus = upper;
      }
    }

    const updatedOrder = OrderRepository.updateOrderStatus(rawTarget, { 
      orderStatus: normalizedStatus, 
      trackingNumber: trackingNumber !== undefined ? String(trackingNumber).trim() : undefined 
    });

    return successResponse(res, 200, 'Status pesanan berhasil diperbarui', updatedOrder);
  });
}

