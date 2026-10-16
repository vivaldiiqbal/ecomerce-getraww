import { AuthService } from '../services/authService.js';
import { errorResponse } from '../utils/responseFormatter.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Akses ditolak. Token autentikasi tidak ditemukan.', 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return errorResponse(res, 401, 'Token autentikasi tidak valid atau telah kedaluwarsa.', 'Unauthorized');
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Akses ditolak. Membutuhkan hak akses administrator.', 'Forbidden');
  }
};
