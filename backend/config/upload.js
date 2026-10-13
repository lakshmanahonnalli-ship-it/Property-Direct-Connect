import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is fully configured
const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer Disk Storage (local backup or primary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WebP images are permitted'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
});

/**
 * Upload files either to Cloudinary (if credentials exist) or return local URLs.
 */
export const processUploadedFiles = async (files, req) => {
  if (!files || files.length === 0) return [];

  const processedImages = [];
  const host = `${req.protocol}://${req.get('host')}`;

  for (const file of files) {
    if (isCloudinaryConfigured()) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'propertyconnect/properties',
          resource_type: 'image',
        });
        // Remove local file after successful Cloudinary upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        processedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
        continue;
      } catch (err) {
        console.warn(`[Cloudinary] Upload failed for ${file.filename}, using local storage fallback:`, err.message);
      }
    }

    // Local file fallback
    processedImages.push({
      url: `${host}/uploads/${file.filename}`,
      publicId: file.filename,
    });
  }

  return processedImages;
};
