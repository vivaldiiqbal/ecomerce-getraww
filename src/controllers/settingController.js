import { BaseRepository } from '../repositories/baseRepository.js';
import { successResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';

export class SettingController {
  static getSettings = asyncHandler(async (req, res) => {
    const settings = BaseRepository.dbData.settings || {
      storeName: 'GETRAW',
      whatsappNumber: '081234567890',
      flatShippingRate: 12000
    };
    
    return successResponse(res, 200, 'Berhasil memuat pengaturan', settings);
  });

  static updateSettings = asyncHandler(async (req, res) => {
    const { storeName, whatsappNumber, flatShippingRate, newAdminPassword } = req.body;

    // Ensure settings object exists
    if (!BaseRepository.dbData.settings) {
      BaseRepository.dbData.settings = {};
    }

    if (storeName) BaseRepository.dbData.settings.storeName = storeName;
    if (whatsappNumber) BaseRepository.dbData.settings.whatsappNumber = whatsappNumber;
    if (flatShippingRate !== undefined) BaseRepository.dbData.settings.flatShippingRate = Number(flatShippingRate);

    // Update Admin Password if provided
    if (newAdminPassword && newAdminPassword.trim().length > 0) {
      const adminId = req.user.id; // from authMiddleware
      const adminIndex = BaseRepository.dbData.users.findIndex(u => u.id === adminId && u.role === 'admin');
      
      if (adminIndex !== -1) {
        BaseRepository.dbData.users[adminIndex].passwordHash = bcrypt.hashSync(newAdminPassword, 10);
      }
    }

    BaseRepository.saveSync();

    return successResponse(res, 200, 'Pengaturan berhasil disimpan.', BaseRepository.dbData.settings);
  });
}
