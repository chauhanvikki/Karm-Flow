import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

// Force load env vars here to fix module loading order issues
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Only allow pdf, doc, docx
    const allowedFormats = ['pdf', 'doc', 'docx'];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    
    if (!ext || !allowedFormats.includes(ext)) {
      throw new Error('Invalid file format. Only PDF, DOC, and DOCX are allowed.');
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);

    return {
      resource_type: 'raw', // Must be raw for PDFs/DOCs to avoid Cloudinary PDF processing restrictions
      public_id: `resume-${uniqueId}.${ext}`, // Force extension so it downloads correctly
    };
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
  },
});

// Removed cloudinary export
