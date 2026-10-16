import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { productsSeed } from '../data/productsSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, '../data/db.json');

export class BaseRepository {
  static dbData = {
    products: [],
    users: [],
    orders: []
  };

  /**
   * Initializes In-Memory Database with Auto-Fallback to Seed Data & Admin Account
   */
  static init() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          this.dbData.products = parsed.products;
        } else {
          this.dbData.products = [...productsSeed];
        }
        
        this.dbData.users = Array.isArray(parsed?.users) ? parsed.users : [];
        this.dbData.orders = Array.isArray(parsed?.orders) ? parsed.orders : [];
      } else {
        this.dbData.products = [...productsSeed];
        this.dbData.users = [];
        this.dbData.orders = [];
      }

      // Ensure Default Admin Account Exists
      const adminEmail = 'admin@getraw.com';
      const adminExists = this.dbData.users.some(u => u.email.toLowerCase() === adminEmail);
      if (!adminExists) {
        this.dbData.users.push({
          id: 'usr_admin_001',
          name: 'Admin Getraw',
          email: adminEmail,
          phone: '081234567890',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          memberStatus: 'System Administrator',
          joinedDate: 'Oktober 2026',
          createdAt: new Date().toISOString()
        });
      }

      this.saveSync();
    } catch (error) {
      console.warn('⚠️ BaseRepository: db.json invalid/corrupted. Fallback to initial seed data.', error.message);
      this.dbData.products = [...productsSeed];
      this.dbData.users = [{
        id: 'usr_admin_001',
        name: 'Admin Getraw',
        email: 'admin@getraw.com',
        phone: '081234567890',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        memberStatus: 'System Administrator',
        joinedDate: 'Oktober 2026',
        createdAt: new Date().toISOString()
      }];
      this.dbData.orders = [];
      this.saveSync();
    }
  }

  /**
   * Synchronizes In-Memory State to local db.json safely
   */
  static saveSync() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.dbData, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ BaseRepository: Failed to save to db.json', err.message);
    }
  }
}

// Auto-initialize on module load
BaseRepository.init();
