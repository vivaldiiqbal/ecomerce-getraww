import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure public/uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${uniqueSuffix}${ext}`);
  }
});

// File Filter (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeTypeMatch = allowedTypes.test(file.mimetype.toLowerCase());
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeTypeMatch && extMatch) {
    return cb(null, true);
  }
  
  const err = new Error('Format file tidak didukung! Hanya file .jpg, .jpeg, .png, dan .webp yang diperbolehkan.');
  err.statusCode = 400;
  cb(err, false);
};

// Multer Upload Instance (Max 5MB)
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});
