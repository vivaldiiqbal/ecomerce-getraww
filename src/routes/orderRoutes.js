import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { checkoutCalculateSchema, checkoutOrderSchema } from '../validators/orderValidator.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/calculate', validateBody(checkoutCalculateSchema), OrderController.calculateCheckout);
router.post('/checkout', validateBody(checkoutOrderSchema), OrderController.checkout);
router.get('/:orderNumber', OrderController.getOrderByNumber);
router.post('/:orderNumber/simulate-pay', OrderController.simulatePay);

// Admin Routes
router.get('/', authMiddleware, isAdmin, OrderController.getAllOrders);
router.put('/:id/status', authMiddleware, isAdmin, OrderController.updateOrderStatus);

export default router;
