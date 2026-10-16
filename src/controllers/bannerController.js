import { asyncHandler } from '../utils/asyncHandler.js';
import { BannerService } from '../services/bannerService.js';
import { successResponse } from '../utils/responseFormatter.js';

export class BannerController {
  /**
   * GET /api/v1/banners
   */
  static getBanners = asyncHandler(async (req, res) => {
    const banners = BannerService.getBanners();
    return successResponse(res, 200, 'Daftar gambar hero slider berhasil dimuat.', banners);
  });
}
