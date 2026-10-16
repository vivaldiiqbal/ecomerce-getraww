import { BaseRepository } from '../repositories/baseRepository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class UserController {
  static getUsers = asyncHandler(async (req, res) => {
    // Only return users with role === 'user'
    const customers = BaseRepository.dbData.users.filter(u => u.role === 'user' || !u.role);
    
    // Omit passwordHash for security
    const safeCustomers = customers.map(({ passwordHash: _passwordHash, ...user }) => user);
    
    return successResponse(res, 200, 'Berhasil memuat data pelanggan', safeCustomers);
  });

  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const userIndex = BaseRepository.dbData.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return errorResponse(res, 404, 'Pelanggan tidak ditemukan.', 'NotFound');
    }

    const user = BaseRepository.dbData.users[userIndex];
    if (user.role === 'admin') {
      return errorResponse(res, 403, 'Tidak dapat menghapus akun administrator.', 'Forbidden');
    }

    BaseRepository.dbData.users.splice(userIndex, 1);
    BaseRepository.saveSync();

    return successResponse(res, 200, 'Pelanggan berhasil dihapus.', null);
  });
}
