import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
