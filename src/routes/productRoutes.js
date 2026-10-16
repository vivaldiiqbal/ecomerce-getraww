import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Read Routes
router.get('/', ProductController.getProducts);
router.get('/:id/:slug', ProductController.getProductByIdAndSlug);

// Protected Product CRUD Routes (Admin Only)
router.post('/', authMiddleware, isAdmin, upload.single('image'), ProductController.createProduct);
router.put('/:id', authMiddleware, isAdmin, upload.single('image'), ProductController.updateProduct);
router.delete('/:id', authMiddleware, isAdmin, ProductController.deleteProduct);

export default router;
