import { BaseRepository } from './baseRepository.js';

export class UserRepository {
  static findByEmail(email) {
    if (!email) return null;
    return BaseRepository.dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findById(id) {
    return BaseRepository.dbData.users.find(u => u.id === String(id));
  }

  static create(userPayload) {
    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: userPayload.name,
      email: userPayload.email,
      phone: userPayload.phone || '081289341029',
      passwordHash: userPayload.passwordHash,
      role: userPayload.role || 'user',
      memberStatus: userPayload.role === 'admin' ? 'System Administrator' : 'GETRAW® Gold Member',
      joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    BaseRepository.dbData.users.push(newUser);
    BaseRepository.saveSync();
    return newUser;
  }
}
