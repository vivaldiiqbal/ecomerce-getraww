import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { productsSeed } from '../data/productsSeed.js';
import { SQLiteDatabase } from '../data/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, '../data/db.json');

export class BaseRepository {
  static dbData = {
    products: [],
    users: [],
    orders: [],
    settings: {
      storeName: 'GETRAW',
      whatsappNumber: '081234567890',
      flatShippingRate: 12000
    }
  };

  /**
   * Initializes Database with SQLite & Auto-Migration from seed/db.json
   */
  static init() {
    try {
      // 1. Inisialisasi dan migrasi ke SQLite
      SQLiteDatabase.initAndMigrate();

      // 2. Ambil data aktif dari SQLite
      const sqliteProducts = SQLiteDatabase.getAllProducts();
      const sqliteUsers = SQLiteDatabase.getAllUsers();
      const sqliteOrders = SQLiteDatabase.getAllOrders();
      const sqliteSettings = SQLiteDatabase.getSettings();

      if (sqliteProducts && sqliteProducts.length > 0) {
        this.dbData.products = sqliteProducts;
      } else {
        this.dbData.products = [...productsSeed];
      }

      this.dbData.users = sqliteUsers || [];
      this.dbData.orders = sqliteOrders || [];
      this.dbData.settings = sqliteSettings || {
        storeName: 'GETRAW',
        whatsappNumber: '081234567890',
        flatShippingRate: 12000
      };

      // 3. Pastikan Akun Administrator Default Selalu Tersedia
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

      // 4. Sinkronisasi persistensi
      this.saveSync();
    } catch (error) {
      console.warn('⚠️ BaseRepository: SQLite init error, fallback ke json backup.', error.message);
      this.fallbackJsonInit();
    }
  }

  /**
   * Fallback inisialisasi jika SQLite mengalami kendala
   */
  static fallbackJsonInit() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.dbData.products = Array.isArray(parsed?.products) && parsed.products.length > 0 ? parsed.products : [...productsSeed];
        this.dbData.users = Array.isArray(parsed?.users) ? parsed.users : [];
        this.dbData.orders = Array.isArray(parsed?.orders) ? parsed.orders : [];
        if (parsed?.settings) this.dbData.settings = parsed.settings;
      } else {
        this.dbData.products = [...productsSeed];
        this.dbData.users = [];
        this.dbData.orders = [];
      }
    } catch {
      this.dbData.products = [...productsSeed];
    }
  }

  /**
   * Menyimpan data secara atomik ke database SQLite dan snapshot db.json
   */
  static saveSync() {
    // 1. Simpan ke SQLite
    try {
      SQLiteDatabase.syncAll(this.dbData);
    } catch (sqliteErr) {
      console.error('❌ BaseRepository: Gagal sync ke SQLite:', sqliteErr.message);
    }

    // 2. Simpan backup file JSON
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.dbData, null, 2), 'utf-8');
    } catch (jsonErr) {
      console.error('❌ BaseRepository: Gagal simpan ke db.json:', jsonErr.message);
    }
  }
}

// Auto-initialize on module load
BaseRepository.init();
