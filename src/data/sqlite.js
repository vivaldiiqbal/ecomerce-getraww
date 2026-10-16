import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { productsSeed } from './productsSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path: src/data/getraw.sqlite (configurable via SQLITE_DB_PATH)
const DB_DIR = __dirname;
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(DB_DIR, 'getraw.sqlite');
const LEGACY_JSON_PATH = path.join(DB_DIR, 'db.json');

let dbInstance = null;

export class SQLiteDatabase {
  /**
   * Mendapatkan koneksi singleton SQLite dengan mode WAL (Write-Ahead Logging)
   */
  static getDB() {
    if (!dbInstance) {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      dbInstance = new Database(DB_PATH);
      // Optimasi performa dan concurrency SQLite
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
      dbInstance.pragma('foreign_keys = ON');

      this.initSchema();
    }
    return dbInstance;
  }

  /**
   * Membuat tabel schema jika belum ada
   */
  static initSchema() {
    const db = dbInstance;

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        member_status TEXT,
        joined_date TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        category TEXT,
        original_price INTEGER DEFAULT 0,
        discount_percentage INTEGER DEFAULT 0,
        final_price INTEGER DEFAULT 0,
        discount TEXT,
        image TEXT,
        hover_image TEXT,
        sizes TEXT,
        stock_per_size TEXT,
        in_stock INTEGER DEFAULT 1,
        description TEXT,
        fabric TEXT,
        is_new INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        order_number TEXT PRIMARY KEY,
        date TEXT,
        customer TEXT,
        items TEXT,
        subtotal_original INTEGER DEFAULT 0,
        subtotal_final INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        shipping_cost INTEGER DEFAULT 0,
        grand_total INTEGER DEFAULT 0,
        payment_method TEXT,
        payment_status TEXT,
        order_status TEXT,
        tracking_number TEXT,
        paid_at TEXT,
        qr_code_data TEXT,
        virtual_account_no TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  /**
   * Inisialisasi awal & migrasi data otomatis dari db.json / productsSeed ke SQLite
   */
  static initAndMigrate() {
    const db = this.getDB();

    const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
    const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

    // Migrasi jika tabel produk atau user masih kosong
    if (productCount === 0 || userCount === 0) {
      console.log('🔄 SQLiteDatabase: Memulai inisialisasi & migrasi data ke SQLite...');

      let initialProducts = productsSeed;
      let initialUsers = [];
      let initialOrders = [];
      let initialSettings = {
        storeName: 'GETRAW',
        whatsappNumber: '081234567890',
        flatShippingRate: 12000
      };

      // Cek apakah ada db.json lama untuk diimpor
      if (fs.existsSync(LEGACY_JSON_PATH)) {
        try {
          const raw = fs.readFileSync(LEGACY_JSON_PATH, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
            initialProducts = parsed.products;
          }
          if (parsed.users && Array.isArray(parsed.users)) {
            initialUsers = parsed.users;
          }
          if (parsed.orders && Array.isArray(parsed.orders)) {
            initialOrders = parsed.orders;
          }
          if (parsed.settings && typeof parsed.settings === 'object') {
            initialSettings = { ...initialSettings, ...parsed.settings };
          }
        } catch (err) {
          console.warn('⚠️ Gagal membaca db.json lama, menggunakan seed bawaan.', err.message);
        }
      }

      // Pastikan Admin default ada
      const adminEmail = 'admin@getraw.com';
      const hasAdmin = initialUsers.some(u => u.email.toLowerCase() === adminEmail);
      if (!hasAdmin) {
        initialUsers.push({
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

      // Simpan batch ke SQLite dalam transaksi ACID
      const insertProduct = db.prepare(`
        INSERT OR REPLACE INTO products (
          id, title, slug, category, original_price, discount_percentage, final_price,
          discount, image, hover_image, sizes, stock_per_size, in_stock, description, fabric, is_new, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const insertUser = db.prepare(`
        INSERT OR REPLACE INTO users (
          id, name, email, phone, password_hash, role, member_status, joined_date, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const insertOrder = db.prepare(`
        INSERT OR REPLACE INTO orders (
          order_number, date, customer, items, subtotal_original, subtotal_final, discount,
          shipping_cost, grand_total, payment_method, payment_status, order_status, tracking_number,
          paid_at, qr_code_data, virtual_account_no, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const insertSetting = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
      `);

      const migrateTx = db.transaction(() => {
        if (productCount === 0) {
          for (const p of initialProducts) {
            insertProduct.run(
              String(p.id),
              p.title || 'Produk',
              p.slug || '',
              p.category || 'Tees',
              Number(p.originalPrice) || 0,
              Number(p.discountPercentage) || 0,
              Number(p.finalPrice) || 0,
              p.discount || null,
              p.image || '',
              p.hoverImage || '',
              JSON.stringify(p.sizes || []),
              JSON.stringify(p.stockPerSize || {}),
              p.inStock ? 1 : 0,
              p.description || '',
              p.fabric || '',
              p.isNew ? 1 : 0,
              p.createdAt || new Date().toISOString(),
              p.updatedAt || null
            );
          }
        }

        if (userCount === 0) {
          for (const u of initialUsers) {
            insertUser.run(
              String(u.id),
              u.name || 'User',
              u.email.toLowerCase(),
              u.phone || '',
              u.passwordHash || '',
              u.role || 'user',
              u.memberStatus || '',
              u.joinedDate || '',
              u.createdAt || new Date().toISOString()
            );
          }
        }

        for (const o of initialOrders) {
          insertOrder.run(
            String(o.orderNumber),
            o.date || '',
            JSON.stringify(o.customer || {}),
            JSON.stringify(o.items || []),
            Number(o.subtotalOriginal) || 0,
            Number(o.subtotalFinal) || 0,
            Number(o.discount) || 0,
            Number(o.shippingCost) || 0,
            Number(o.grandTotal) || 0,
            o.paymentMethod || 'QRIS',
            o.paymentStatus || 'UNPAID',
            o.orderStatus || 'PENDING',
            o.trackingNumber || '',
            o.paidAt || null,
            o.qrCodeData || '',
            o.virtualAccountNo || '',
            o.createdAt || new Date().toISOString()
          );
        }

        for (const [key, val] of Object.entries(initialSettings)) {
          insertSetting.run(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });

      migrateTx();
      console.log(`✅ SQLiteDatabase: Migrasi selesai. Database tersimpan di ${DB_PATH}`);
    }
  }

  /**
   * Mengambil semua produk dari SQLite
   */
  static getAllProducts() {
    const db = this.getDB();
    const rows = db.prepare('SELECT * FROM products ORDER BY rowid DESC').all();
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      originalPrice: r.original_price,
      discountPercentage: r.discount_percentage,
      finalPrice: r.final_price,
      discount: r.discount,
      image: r.image,
      hoverImage: r.hover_image,
      sizes: r.sizes ? JSON.parse(r.sizes) : [],
      stockPerSize: r.stock_per_size ? JSON.parse(r.stock_per_size) : {},
      inStock: Boolean(r.in_stock),
      description: r.description,
      fabric: r.fabric,
      isNew: Boolean(r.is_new),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  /**
   * Mengambil semua user dari SQLite
   */
  static getAllUsers() {
    const db = this.getDB();
    const rows = db.prepare('SELECT * FROM users').all();
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      passwordHash: r.password_hash,
      role: r.role,
      memberStatus: r.member_status,
      joinedDate: r.joined_date,
      createdAt: r.created_at
    }));
  }

  /**
   * Mengambil semua pesanan dari SQLite
   */
  static getAllOrders() {
    const db = this.getDB();
    const rows = db.prepare('SELECT * FROM orders ORDER BY rowid DESC').all();
    return rows.map(r => ({
      orderNumber: r.order_number,
      date: r.date,
      customer: r.customer ? JSON.parse(r.customer) : {},
      items: r.items ? JSON.parse(r.items) : [],
      subtotalOriginal: r.subtotal_original,
      subtotalFinal: r.subtotal_final,
      discount: r.discount,
      shippingCost: r.shipping_cost,
      grandTotal: r.grand_total,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      orderStatus: r.order_status,
      trackingNumber: r.tracking_number,
      paidAt: r.paid_at,
      qrCodeData: r.qr_code_data,
      virtualAccountNo: r.virtual_account_no,
      createdAt: r.created_at
    }));
  }

  /**
   * Mengambil settings dari SQLite
   */
  static getSettings() {
    const db = this.getDB();
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {
      storeName: 'GETRAW',
      whatsappNumber: '081234567890',
      flatShippingRate: 12000
    };
    for (const r of rows) {
      if (r.key === 'flatShippingRate') {
        settings[r.key] = Number(r.value);
      } else {
        settings[r.key] = r.value;
      }
    }
    return settings;
  }

  /**
   * Sinkronisasi seluruh data ke SQLite dalam satu transaksi ACID
   */
  static syncAll({ products, users, orders, settings }) {
    const db = this.getDB();

    const insertProduct = db.prepare(`
      INSERT OR REPLACE INTO products (
        id, title, slug, category, original_price, discount_percentage, final_price,
        discount, image, hover_image, sizes, stock_per_size, in_stock, description, fabric, is_new, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (
        id, name, email, phone, password_hash, role, member_status, joined_date, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const insertOrder = db.prepare(`
      INSERT OR REPLACE INTO orders (
        order_number, date, customer, items, subtotal_original, subtotal_final, discount,
        shipping_cost, grand_total, payment_method, payment_status, order_status, tracking_number,
        paid_at, qr_code_data, virtual_account_no, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);

    const syncTx = db.transaction(() => {
      // Hapus & replace untuk memastikan sinkronisasi akurat
      db.exec('DELETE FROM products; DELETE FROM users; DELETE FROM orders; DELETE FROM settings;');

      if (Array.isArray(products)) {
        for (const p of products) {
          insertProduct.run(
            String(p.id),
            p.title || 'Produk',
            p.slug || '',
            p.category || 'Tees',
            Number(p.originalPrice) || 0,
            Number(p.discountPercentage) || 0,
            Number(p.finalPrice) || 0,
            p.discount || null,
            p.image || '',
            p.hoverImage || '',
            JSON.stringify(p.sizes || []),
            JSON.stringify(p.stockPerSize || {}),
            p.inStock ? 1 : 0,
            p.description || '',
            p.fabric || '',
            p.isNew ? 1 : 0,
            p.createdAt || new Date().toISOString(),
            p.updatedAt || null
          );
        }
      }

      if (Array.isArray(users)) {
        for (const u of users) {
          insertUser.run(
            String(u.id),
            u.name || 'User',
            u.email.toLowerCase(),
            u.phone || '',
            u.passwordHash || '',
            u.role || 'user',
            u.memberStatus || '',
            u.joinedDate || '',
            u.createdAt || new Date().toISOString()
          );
        }
      }

      if (Array.isArray(orders)) {
        for (const o of orders) {
          insertOrder.run(
            String(o.orderNumber),
            o.date || '',
            JSON.stringify(o.customer || {}),
            JSON.stringify(o.items || []),
            Number(o.subtotalOriginal) || 0,
            Number(o.subtotalFinal) || 0,
            Number(o.discount) || 0,
            Number(o.shippingCost) || 0,
            Number(o.grandTotal) || 0,
            o.paymentMethod || 'QRIS',
            o.paymentStatus || 'UNPAID',
            o.orderStatus || 'PENDING',
            o.trackingNumber || '',
            o.paidAt || null,
            o.qrCodeData || '',
            o.virtualAccountNo || '',
            o.createdAt || new Date().toISOString()
          );
        }
      }

      if (settings && typeof settings === 'object') {
        for (const [key, val] of Object.entries(settings)) {
          insertSetting.run(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      }
    });

    syncTx();
  }
}
