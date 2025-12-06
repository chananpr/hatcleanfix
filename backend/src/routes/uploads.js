import { Router } from 'express';
import multer from 'multer';
import { uploadBufferToSpaces } from '../lib/spaces.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB max

router.post('/', requireAuth, upload.fields([{ name: 'main', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'gallery' }]), async (req, res) => {
  try {
    const result = {
      main: null,
      video: null,
      gallery: []
    };

    const handleFile = async (file, kind) => {
      const { buffer, mimetype, originalname, size } = file;
      const { key, url } = await uploadBufferToSpaces(buffer, mimetype, originalname);
      return { key, url, mime: mimetype, size, kind };
    };

    if (req.files?.main?.length) {
      result.main = await handleFile(req.files.main[0], 'main');
    }
    if (req.files?.video?.length) {
      result.video = await handleFile(req.files.video[0], 'video');
    }
    if (req.files?.gallery?.length) {
      for (const f of req.files.gallery) {
        const uploaded = await handleFile(f, 'gallery');
        result.gallery.push(uploaded);
      }
    }

    return res.json(result);
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
