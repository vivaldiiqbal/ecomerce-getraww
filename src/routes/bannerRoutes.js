import { Router } from 'express';
import { BannerController } from '../controllers/bannerController.js';

const router = Router();

router.get('/', BannerController.getBanners);

export default router;
