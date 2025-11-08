import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pbAuth from '../middlewares/pbAuth.js';
import pbAdmin from '../pbAdminClient.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'backend', 'tmp_uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

router.get('/profile', pbAuth, async (req, res) => {
  try {
    const r = await pbAdmin.collection('users').getOne(req.user.id);
    res.json({ success: true, user: { id: r.id, email: r.email, name: r.name, avatar: r.avatar } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

router.put('/profile', pbAuth, async (req, res) => {
  try {
    const { name } = req.body || {};
    const u = await pbAdmin.collection('users').update(req.user.id, { name });
    res.json({ success: true, message: 'Profile updated', user: { id: u.id, email: u.email, name: u.name, avatar: u.avatar } });
  } catch (e) {
    res.status(400).json({ success: false, message: e?.message || 'Update failed' });
  }
});

router.post('/avatar', pbAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const form = { avatar: fs.createReadStream(req.file.path) };
    const u = await pbAdmin.collection('users').update(req.user.id, form);
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, message: 'Avatar updated', user: { id: u.id, email: u.email, name: u.name, avatar: u.avatar } });
  } catch (e) {
    res.status(400).json({ success: false, message: e?.message || 'Avatar upload failed' });
  }
});

export default router;