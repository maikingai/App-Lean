import express from 'express';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

// Create meeting for a class (teacher/admin)
router.post('/:classId', pbAuth, async (req, res) => {
	try {
		const { title, datetime, link, notes } = req.body || {};
		if (!title || !datetime) return res.status(400).json({ success: false, message: 'Missing title or datetime' });
		const meeting = await pbAdmin.collection('meetings').create({ class: req.params.classId, title, datetime, link, notes });
		res.status(201).json({ success: true, meeting });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// List meetings for class
router.get('/class/:classId', async (req, res) => {
	try {
		const list = await pbAdmin.collection('meetings').getFullList({ filter: `class = "${req.params.classId}"` });
		res.json({ success: true, items: list });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

export default router;