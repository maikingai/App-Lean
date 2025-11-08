import express from 'express';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

// Helper: generate a short unique class code (6 chars A-Z0-9)
function genCode(len = 6) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let out = '';
	for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
	return out;
}

// Create a class (admin or teacher)
router.post('/', pbAuth, async (req, res) => {
	try {
		// Only admins and teachers can create classes
		const role = req.user?.role;
		if (role !== 'admin' && role !== 'teacher') return res.status(403).json({ success: false, message: 'Forbidden' });

		// Expect UI to send { name, section, teacher? }
		const { name, section, teacher } = req.body || {};
		if (!name) return res.status(400).json({ success: false, message: 'Missing name' });

		// If creator is a teacher, force teacher to be the creating user
		const data = { name };
		if (typeof section !== 'undefined') data.section = section;
		if (role === 'teacher') {
			data.teacher = req.user.id;
		} else if (role === 'admin' && typeof teacher !== 'undefined') {
			data.teacher = teacher;
		}

		// generate unique class code (field name `code` in PocketBase schema)
		let codeVal;
		let attempts = 0;
		while (!codeVal && attempts < 6) {
			attempts++;
			const c = genCode(6);
			const exists = await pbAdmin.collection('classes').getList(1, 1, { filter: `code = "${c}"` }).catch(() => ({ totalItems: 0 }));
			if (!exists || !exists.totalItems) {
				codeVal = c;
				break;
			}
		}
		if (!codeVal) codeVal = genCode(8); // fallback
		data.code = codeVal;

		const record = await pbAdmin.collection('classes').create(data);
		res.status(201).json({ success: true, class: record });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// List classes (optionally filter by teacher)
router.get('/', async (req, res) => {
	try {
		const { teacher } = req.query || {};
		const filter = teacher ? `teacher = "${teacher}"` : undefined;
		const list = filter ? await pbAdmin.collection('classes').getFullList({ filter }) : await pbAdmin.collection('classes').getFullList();
		res.json({ success: true, items: list });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// List classes for the authenticated user
router.get('/mine', pbAuth, async (req, res) => {
	try {
		console.log('[classes] GET /mine called', { user: req.user && { id: req.user.id, role: req.user.role } });
		if (!pbAdmin || !pbAdmin.authStore) console.warn('[classes] pbAdmin or authStore missing');
		else console.log('[classes] pbAdmin.authStore.isValid=', !!pbAdmin.authStore.isValid);
		const userId = req.user?.id;
		const role = req.user?.role;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		if (role === 'student') {
			// find enrollments for this user
		const enrollments = await pbAdmin.collection('enrollments').getFullList({ filter: `student = "${userId}"` }).catch(() => []);
			const classIds = enrollments.map(e => e.class).filter(Boolean);
			const classes = [];
			for (const cid of classIds) {
				const c = await pbAdmin.collection('classes').getOne(cid).catch(() => null);
				if (c) classes.push(c);
			}
			return res.json({ success: true, items: classes });
		}

		if (role === 'teacher') {
			const list = await pbAdmin.collection('classes').getFullList({ filter: `teacher = "${userId}"` });
			return res.json({ success: true, items: list });
		}

		// admin: return all classes
		const all = await pbAdmin.collection('classes').getFullList();
		return res.json({ success: true, items: all });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Join a class (students can join; teachers/admins can also join)
router.post('/:id/join', pbAuth, async (req, res) => {
	try {
		console.log('[classes] POST /:id/join called', { params: req.params, user: req.user && { id: req.user.id, role: req.user.role } });
		if (!pbAdmin || !pbAdmin.authStore) console.warn('[classes] pbAdmin or authStore missing at join');
		else console.log('[classes] pbAdmin.authStore.isValid at join=', !!pbAdmin.authStore.isValid);
		const classId = req.params.id;
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		// check class exists
		const cls = await pbAdmin.collection('classes').getOne(classId).catch(() => null);
		if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

		// check if enrollment exists
		const existing = await pbAdmin.collection('enrollments').getList(1, 1, { filter: `class = "${classId}" && student = "${userId}"` }).catch((err) => {
			console.warn('[classes] enrollments.getList failed', err && (err.message || err));
			return ({ total: 0 });
		});
		if (existing && existing.total && existing.total > 0) return res.json({ success: true, message: 'Already joined' });

		const payload = { class: classId, student: userId, joined_at: new Date().toISOString(), status: 'active', role_in_class: 'student' };
		console.log('[classes] creating enrollment payload=', payload);
		const rec = await pbAdmin.collection('enrollments').create(payload).catch((err) => {
			console.warn('[classes] enrollments.create failed', err && (err.message || err));
			throw err;
		});
		console.log('[classes] enrollment created', { id: rec?.id });
		res.json({ success: true, enrollment: rec });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Join by classcode (POST { classcode }) - convenience for students who have a code
router.post('/join-by-code', pbAuth, async (req, res) => {
	try {
		console.log('[classes] POST /join-by-code called', { body: req.body, user: req.user && { id: req.user.id, role: req.user.role } });
		if (!pbAdmin || !pbAdmin.authStore) console.warn('[classes] pbAdmin or authStore missing at join-by-code');
		else console.log('[classes] pbAdmin.authStore.isValid at join-by-code=', !!pbAdmin.authStore.isValid);
		const { classcode } = req.body || {};
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
		if (!classcode) return res.status(400).json({ success: false, message: 'Missing classcode' });

		// find the class with this classcode
		const list = await pbAdmin.collection('classes').getList(1, 1, { filter: `code = "${classcode}"` }).catch((err) => {
			console.warn('[classes] classes.getList failed', err && (err.message || err));
			return ({ totalItems: 0 });
		});
		if (!list || !list.totalItems) return res.status(404).json({ success: false, message: 'Class not found' });
		const cls = list.items[0];

		const classId = cls.id;
		// check if enrollment exists
		const existing = await pbAdmin.collection('enrollments').getList(1, 1, { filter: `class = "${classId}" && student = "${userId}"` }).catch((err) => {
			console.warn('[classes] enrollments.getList failed (join-by-code)', err && (err.message || err));
			return ({ total: 0 });
		});
		if (existing && existing.total && existing.total > 0) return res.json({ success: true, message: 'Already joined', class: cls });

		const payload = { class: classId, student: userId, joined_at: new Date().toISOString(), status: 'active', role_in_class: 'student' };
		console.log('[classes] creating enrollment (join-by-code) payload=', payload);
		const rec = await pbAdmin.collection('enrollments').create(payload).catch((err) => {
			console.warn('[classes] enrollments.create failed (join-by-code)', err && (err.message || err));
			throw err;
		});
		console.log('[classes] enrollment created (join-by-code)', { id: rec?.id });
		res.json({ success: true, enrollment: rec, class: cls });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Get class by id
router.get('/:id', async (req, res) => {
	try {
		const r = await pbAdmin.collection('classes').getOne(req.params.id);
		res.json({ success: true, class: r });
	} catch (e) {
		res.status(404).json({ success: false, message: 'Class not found' });
	}
});

// Update class by id (teacher or admin)
router.put('/:id', pbAuth, async (req, res) => {
	try {
		const id = req.params.id;
		const existing = await pbAdmin.collection('classes').getOne(id).catch(() => null);
		if (!existing) return res.status(404).json({ success: false, message: 'Class not found' });

		const userId = req.user?.id;
		const isTeacher = existing.teacher === userId;
		const isAdmin = req.user?.role === 'admin';
		if (!isTeacher && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

			// Allow updating name/section/teacher
			const { name, section, teacher } = req.body || {};
			const data = {};
			if (typeof name !== 'undefined') data.name = name;
			if (typeof section !== 'undefined') data.section = section;
			if (typeof teacher !== 'undefined') data.teacher = teacher;

			const updated = await pbAdmin.collection('classes').update(id, data);
			res.json({ success: true, class: updated });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

// Delete class by id (teacher or admin)
router.delete('/:id', pbAuth, async (req, res) => {
	try {
		const id = req.params.id;
		const existing = await pbAdmin.collection('classes').getOne(id).catch(() => null);
		if (!existing) return res.status(404).json({ success: false, message: 'Class not found' });

		const userId = req.user?.id;
		const isTeacher = existing.teacher === userId;
		const isAdmin = req.user?.role === 'admin';
		if (!isTeacher && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

		// delete enrollments for this class to keep DB consistent
		try {
			const enrolls = await pbAdmin.collection('enrollments').getFullList({ filter: `class = "${id}"` }).catch(() => []);
			for (const e of enrolls) {
				await pbAdmin.collection('enrollments').delete(e.id).catch(() => null);
			}
		} catch (err) {
			// non-fatal - continue to delete class record
		}

		await pbAdmin.collection('classes').delete(id);
		res.json({ success: true, message: 'Class deleted' });
	} catch (e) {
		res.status(500).json({ success: false, message: e?.message || String(e) });
	}
});

export default router;
