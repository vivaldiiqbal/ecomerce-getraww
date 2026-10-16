import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, isAdmin, UserController.getUsers);
router.delete('/:id', authMiddleware, isAdmin, UserController.deleteUser);

export default router;
