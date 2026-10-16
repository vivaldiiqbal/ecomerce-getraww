import { OrderRepository } from '../repositories/orderRepository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/revenue
   * Aggregates real-time store revenue from successful orders (Single Source of Truth)
   * Protected: Admin only
   */
  static getRevenueAnalytics = asyncHandler(async (req, res) => {
    try {
      const allOrders = OrderRepository.findAll() || [];
      const successfulOrders = [];
      let totalRevenue = 0;

      // Single-pass O(N) aggregation: Hanya pesanan berhasil dan bukan dibatalkan
      for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        if (!order) continue;

        const status = String(order.orderStatus || '').trim().toUpperCase();
        const payStatus = String(order.paymentStatus || '').trim().toUpperCase();

        if (status.includes('CANCEL') || status.includes('BATAL')) {
          continue;
        }

        const isPaid = payStatus.includes('LUNAS') || payStatus === 'PAID';
        const isCompleted = (status === 'DELIVERED' || status === 'SHIPPED') && payStatus !== 'UNPAID';

        if (isPaid || isCompleted) {
          successfulOrders.push(order);
          const amount = Number(order.grandTotal ?? order.totalAmount ?? order.subtotalFinal ?? 0);
          if (Number.isFinite(amount)) {
            totalRevenue += amount;
          }
        }
      }

      const totalSuccessfulOrders = successfulOrders.length;

      // Anti-Crash: Hindari pembagian dengan nol (NaN / Infinity)
      const averageOrderValue = totalSuccessfulOrders > 0
        ? Math.round(totalRevenue / totalSuccessfulOrders)
        : 0;

      // Ambil 10 transaksi sukses terakhir untuk riwayat pendapatan terkini
      const recentSuccessfulOrders = successfulOrders
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 10);

      return successResponse(res, 200, 'Data analitik pendapatan berhasil dihitung.', {
        totalRevenue,
        totalSuccessfulOrders,
        averageOrderValue,
        recentSuccessfulOrders
      });
    } catch (err) {
      console.error('Analytics Revenue Aggregation Error:', err);
      return errorResponse(res, 500, 'Gagal mengagregasi data pendapatan toko.', 'InternalServerError');
    }
  });
}
