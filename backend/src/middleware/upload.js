const multer = require('multer');
const logger = require('../utils/logger');

/**
 * Image Upload Middleware
 * Handles question image uploads for AI solver
 */

// Memory storage (buffer'da tutuyoruz çünkü sharp ile işleyeceğiz)
const storage = multer.memoryStorage();

// File filter - Sadece görüntü dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Invalid file type uploaded: ${file.mimetype}`);
    cb(new Error('Sadece JPEG, PNG ve WebP formatları desteklenir'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maksimum dosya boyutu
  },
  fileFilter: fileFilter,
});

/**
 * Single image upload
 * Kullanım: upload.single('image')
 */
const uploadSingle = upload.single('image');

/**
 * Error handler wrapper
 * Multer hatalarını yakalayıp kullanıcı dostu mesajlar döner
 */
const handleUploadError = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer hataları
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Beklenmeyen dosya alanı. Lütfen "image" alanını kullanın.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Dosya yükleme hatası: ' + err.message,
      });
    } else if (err) {
      // Diğer hatalar (file filter, etc.)
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Hata yoksa devam et
    next();
  });
};

/**
 * Optional image upload
 * Dosya yoksa da devam eder
 */
const optionalUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.',
        });
      }
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Dosya yoksa veya varsa devam et
    next();
  });
};

/**
 * Validate at least one input (text or image)
 * Metin veya görüntüden en az biri olmalı
 */
const validateQuestionInput = (req, res, next) => {
  const hasText = req.body.questionText && req.body.questionText.trim().length > 0;
  const hasImage = req.file && req.file.buffer;

  if (!hasText && !hasImage) {
    return res.status(400).json({
      success: false,
      message: 'Soru metni veya görüntüsü gereklidir',
    });
  }

  next();
};

module.exports = {
  uploadSingle,
  handleUploadError,
  optionalUpload,
  validateQuestionInput,
};
