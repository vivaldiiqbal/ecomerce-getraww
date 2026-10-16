import { Router } from 'express';
import productRoutes from './productRoutes.js';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import userRoutes from './userRoutes.js';
import settingRoutes from './settingRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/analytics', analyticsRoutes);

export default apiRouter;
