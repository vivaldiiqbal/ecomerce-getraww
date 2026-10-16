import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthService } from '../services/authService.js';
import { successResponse } from '../utils/responseFormatter.js';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    return successResponse(res, 201, 'Pendaftaran akun member berhasil.', result);
  });

  /**
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    return successResponse(res, 200, 'Log masuk berhasil.', result);
  });

  /**
   * GET /api/v1/auth/me
   */
  static getMe = asyncHandler(async (req, res) => {
    const profile = AuthService.getProfile(req.user.id);
    return successResponse(res, 200, 'Profil pengguna berhasil dimuat.', profile);
  });
}
