const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')
const { s3Client, S3_BUCKET } = require('../config/s3')

/**
 * S3 Upload Middleware
 * Supports: product images, order images, customer avatars, etc.
 */

const createUploader = (folder = 'general') => {
  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
        const ext = path.extname(file.originalname)
        cb(null, `${folder}/${uniqueSuffix}${ext}`)
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
      files: 10 // max 10 files per request
    },
    fileFilter: (req, file, cb) => {
      const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i
      if (allowed.test(path.extname(file.originalname))) {
        cb(null, true)
      } else {
        cb(new Error('Only images and PDFs are allowed'), false)
      }
    }
  })
}

// Pre-configured uploaders for different modules
const uploadOrderImages = createUploader('orders').array('images', 10)
const uploadProductImages = createUploader('products').array('images', 10)
const uploadAvatar = createUploader('avatars').single('avatar')
const uploadGeneral = createUploader('general').array('files', 5)

module.exports = {
  createUploader,
  uploadOrderImages,
  uploadProductImages,
  uploadAvatar,
  uploadGeneral
}
