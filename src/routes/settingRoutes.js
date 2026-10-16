import { Router } from 'express';
import { SettingController } from '../controllers/settingController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, isAdmin, SettingController.getSettings);
router.put('/', authMiddleware, isAdmin, SettingController.updateSettings);

export default router;
