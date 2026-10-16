import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/v1/analytics/revenue (Protected: Admin only)
router.get('/revenue', authMiddleware, isAdmin, AnalyticsController.getRevenueAnalytics);

export default router;
