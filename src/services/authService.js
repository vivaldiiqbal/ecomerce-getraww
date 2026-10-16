import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'getraw_streetwear_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        memberStatus: user.memberStatus
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  static async register({ name, email, phone, password }) {
    const existing = UserRepository.findByEmail(email);
    if (existing) {
      const err = new Error(`Email "${email}" sudah terdaftar pada sistem.`);
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await this.hashPassword(password);
    const user = UserRepository.create({
      name,
      email,
      phone,
      passwordHash
    });

    const token = this.generateToken(user);
    
    // Return sanitized profile without password hash
    const { passwordHash: _, ...profile } = user;
    return {
      token,
      user: profile
    };
  }

  static async login({ email, password }) {
    const user = UserRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Email atau kata sandi tidak cocok.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await this.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Email atau kata sandi tidak cocok.');
      err.statusCode = 401;
      throw err;
    }

    const token = this.generateToken(user);
    const { passwordHash: _, ...profile } = user;

    return {
      token,
      user: profile
    };
  }

  static getProfile(userId) {
    const user = UserRepository.findById(userId);
    if (!user) {
      const err = new Error('Profil pengguna tidak ditemukan.');
      err.statusCode = 404;
      throw err;
    }
    const { passwordHash: _, ...profile } = user;
    return profile;
  }
}
