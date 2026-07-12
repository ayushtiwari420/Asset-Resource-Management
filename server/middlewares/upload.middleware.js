const multer = require('multer');
const path = require('path');
const { sendError } = require('../utils/apiResponse');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const handleMulterError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, `File too large. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 400);
      }
      return sendError(res, `File upload error: ${err.message}`, 400);
    }
    if (err) {
      return sendError(res, err.message, 400);
    }
    next();
  });
};

const uploadSingle = (fieldName) => handleMulterError(upload.single(fieldName));

const uploadMultiple = (fieldName, maxCount = 5) =>
  handleMulterError(upload.array(fieldName, maxCount));

module.exports = { uploadSingle, uploadMultiple };
