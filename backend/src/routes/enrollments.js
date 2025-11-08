import express from 'express';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

// Enroll current user into a class
router.post('/:classId/enroll', pbAuth, async (req, res) => {
	try {
		const classId = req.params.classId;
		// only admin/teacher may directly create an active enrollment for a user
		const role = req.user?.role;
		if (role === 'student' || !role) {
			return res.status(403).json({ success: false, message: 'Students must request to join via class code' });
		}

		// admin/teacher: create enrollment, assume active
		const student = req.body?.student || req.user.id; // allow specifying student when admin
		const record = await pbAdmin.collection('enrollments').create({ class: classId, student: student, status: 'active', joined_at: new Date().toISOString() });
		res.status(201).json({ success: true, enrollment: record });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Join a class using its code (students use this to request join)
router.post('/join', pbAuth, async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ success: false, message: 'Missing class code' });

		// find class by code
		const list = await pbAdmin.collection('classes').getList(1, 1, { filter: `code = "${code}"` }).catch(() => ({ items: [] }));
		const items = list?.items || [];
		if (!items || items.length === 0) return res.status(404).json({ success: false, message: 'Class not found' });
		const cls = items[0];

		// check existing enrollment
		const existing = await pbAdmin.collection('enrollments').getFullList({ filter: `class = "${cls.id}" && student = "${req.user.id}"` });
		if (existing && existing.length > 0) return res.status(409).json({ success: false, message: 'Already requested or enrolled' });

		// create enrollment with status 'invited' (teacher/admin can accept and make active)
		const record = await pbAdmin.collection('enrollments').create({ class: cls.id, student: req.user.id, status: 'invited' });
		res.status(201).json({ success: true, enrollment: record });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Unenroll (remove own enrollment)
router.delete('/:classId/enroll', pbAuth, async (req, res) => {
	try {
		const classId = req.params.classId;
		// find enrollment by class and user
		const list = await pbAdmin.collection('enrollments').getFullList({ filter: `class = "${classId}" && user = "${req.user.id}"` });
		if (!list || list.length === 0) return res.status(404).json({ success: false, message: 'Enrollment not found' });
		await pbAdmin.collection('enrollments').delete(list[0].id);
		res.json({ success: true, message: 'Unenrolled' });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

export default router;
