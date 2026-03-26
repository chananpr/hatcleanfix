const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const ctrl = require('./ai-chat.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

const UPLOAD_DIR = '/tmp/ai-chat-uploads'

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB per file, max 5 files
  fileFilter: (req, file, cb) => {
    const allowed = /\.(png|jpg|jpeg|gif|webp|svg|bmp|pdf|txt|md|js|jsx|ts|tsx|json|csv|html|css|sql|py|log|env|yml|yaml|xml|sh)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error(`ไม่รองรับไฟล์ประเภท ${path.extname(file.originalname)}`))
    }
  }
})

router.use(authMiddleware, requireRole('superadmin', 'admin'))

router.get('/threads',              ctrl.listThreads)
router.post('/threads',             ctrl.createThread)
router.get('/threads/:id',          ctrl.getThread)
router.patch('/threads/:id',        ctrl.updateThread)
router.delete('/threads/:id',       ctrl.deleteThread)
router.post('/threads/:id/messages', upload.array('files', 5), ctrl.sendMessage)
router.post('/threads/:id/regenerate', ctrl.regenerate)

module.exports = router
