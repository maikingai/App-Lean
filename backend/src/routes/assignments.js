import express from 'express';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

// Create an assignment (teacher/admin)
router.post('/', pbAuth, async (req, res) => {
	try {
		const { title, classId, dueDate, points, description } = req.body || {};
		if (!title || !classId) return res.status(400).json({ success: false, message: 'Missing title or classId' });
		const record = await pbAdmin.collection('assignments').create({ title, class: classId, dueDate, points, description });
		res.status(201).json({ success: true, assignment: record });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// List assignments for a class
router.get('/class/:classId', async (req, res) => {
	try {
		const list = await pbAdmin.collection('assignments').getFullList({ filter: `class = "${req.params.classId}"` });
		res.json({ success: true, items: list });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Get assignment by id
router.get('/:id', async (req, res) => {
	try {
		const r = await pbAdmin.collection('assignments').getOne(req.params.id);
		res.json({ success: true, assignment: r });
	} catch (e) {
		res.status(404).json({ success: false, message: 'Assignment not found' });
	}
});

export default router;
