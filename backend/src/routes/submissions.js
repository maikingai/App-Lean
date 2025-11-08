import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'backend', 'tmp_uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: (_, __, cb) => cb(null, uploadDir), filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`) });
const upload = multer({ storage });

// Submit an assignment (file upload)
router.post('/:assignmentId', pbAuth, upload.single('file'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
		const stream = fs.createReadStream(req.file.path);
		const form = { file: stream, student: req.user.id, assignment: req.params.assignmentId };
		const submission = await pbAdmin.collection('submissions').create(form);
		fs.unlink(req.file.path, () => {});
		res.status(201).json({ success: true, submission });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// List submissions for an assignment (teacher/admin)
router.get('/assignment/:assignmentId', pbAuth, async (req, res) => {
	try {
		const list = await pbAdmin.collection('submissions').getFullList({ filter: `assignment = "${req.params.assignmentId}"` });
		res.json({ success: true, items: list });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Grade a submission
router.put('/:id/grade', pbAuth, async (req, res) => {
	try {
		const { grade } = req.body || {};
		if (typeof grade === 'undefined') return res.status(400).json({ success: false, message: 'Missing grade' });
		const updated = await pbAdmin.collection('submissions').update(req.params.id, { grade });
		res.json({ success: true, submission: updated });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

export default router;
