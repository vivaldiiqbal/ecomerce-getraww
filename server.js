import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import apiRouter from './src/routes/api.js';
import { notFoundHandler, globalErrorHandler } from './src/middlewares/errorHandler.js';

// Load environment variables (.env) if present
try {
  process.loadEnvFile?.();
} catch {
  // Silent fallback if .env is missing
}

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security Headers (Helmet) with Cross-Origin Resource Sharing for static uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"]
    }
  }
}));

// 2. CORS Policy
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Static File Serving for Product Uploads (/uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// 4. Request Payload Size Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiters
const catalogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    errorType: 'RateLimitExceeded',
    message: 'Terlalu banyak permintaan katalog dari IP Anda. Silakan coba lagi dalam 1 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    errorType: 'RateLimitExceeded',
    message: 'Terlalu banyak permintaan autentikasi atau pesanan dari IP Anda.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 5. Apply Rate Limiters
app.use('/api/v1/products', catalogLimiter);
app.use('/api/v1/auth', authOrderLimiter);
app.use('/api/v1/orders', authOrderLimiter);

// 6. Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Backend E-Commerce Streetwear GETRAW® berjalan normal.',
    timestamp: new Date().toISOString()
  });
});

// 7. Mount Main API Router (/api/v1)
app.use('/api/v1', apiRouter);

// 8. Serve Production Built Frontend (Mendukung folder dist maupun root direktori)
const distPath = path.join(process.cwd(), 'dist');
const rootIndexPath = path.join(process.cwd(), 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(process.cwd()));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    if (fs.existsSync(rootIndexPath)) {
      return res.sendFile(rootIndexPath);
    }
  }
  next();
});

// 9. 404 Route Not Found Handler (For unmatched /api or static routes)
app.use(notFoundHandler);

// 10. Global Error Handler
app.use(globalErrorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 RESTful API Server running at http://localhost:${PORT}`);
  console.log(`📦 Endpoint Katalog  : GET  http://localhost:${PORT}/api/v1/products`);
  console.log(`📌 Endpoint Detail   : GET  http://localhost:${PORT}/api/v1/products/873255/tshirt-dazya-white-getraw`);
  console.log(`🖼️  Endpoint Banner   : GET  http://localhost:${PORT}/api/v1/banners`);
  console.log(`🔑 Endpoint Auth     : POST http://localhost:${PORT}/api/v1/auth/register & /login`);
  console.log(`🛒 Endpoint Checkout : POST http://localhost:${PORT}/api/v1/orders/checkout`);
  console.log(`⚡ Endpoint Bayar    : POST http://localhost:${PORT}/api/v1/orders/#THX-20261008-882/simulate-pay`);
  console.log(`=======================================================`);
});

// Process Listeners & Graceful Shutdown (Anti-Crash)
process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err.name, err.message);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION at:', promise, 'reason:', reason);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed cleanly.');
    process.exit(0);
  });
});
