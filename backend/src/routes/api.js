// backend/src/routes/api.js
import express from "express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// เพิ่ม import ให้ครบ
import pbAuth from "../middlewares/pbAuth.js";
import pbAdmin from "../pbAdminClient.js";

const router = express.Router();

// public health
router.get("/health", (req, res) => res.json({ ok: true }));

// admin status for debugging: returns whether backend has admin credentials and auth state
router.get('/admin/status', async (req, res) => {
  try {
    const pb = pbAdmin; // pocketbase client
    const pbUrl = pb?.baseUrl || process.env.POCKETBASE_URL || process.env.PB_URL || null;
    const adminConfigured = !!(process.env.PB_ADMIN_EMAIL && process.env.PB_ADMIN_PASS);
    const authValid = !!(pb?.authStore && pb.authStore.isValid);

    // if configured but not valid, attempt to login once more to give fresh status
    let attempted = false;
    let attemptResult = null;
    if (adminConfigured && !authValid) {
      attempted = true;
      try {
        // try to auth with env creds
        const email = process.env.PB_ADMIN_EMAIL;
        const pass = process.env.PB_ADMIN_PASS;
        await pb.admins.authWithPassword(email, pass);
        attemptResult = { ok: true, message: 're-authenticated' };
      } catch (err) {
        attemptResult = { ok: false, message: err?.message || String(err) };
      }
    }

    return res.json({ ok: true, pbUrl, adminConfigured, authValid: !!(pb?.authStore && pb.authStore.isValid), attempted, attemptResult });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

// protected route (ใช้ pbAuth แทน authMiddleware)
router.get("/class/:classId/report", pbAuth, async (req, res) => {
  const classId = req.params.classId;

  const userId = req.user?.id;
  const classRecord = await pbAdmin.collection("classes").getOne(classId).catch(() => null);
  if (!classRecord) return res.status(404).json({ error: "class not found" });

  const isTeacher = classRecord.teacher === userId;
  const isAdmin = req.user?.role === "admin";
  if (!isTeacher && !isAdmin) return res.status(403).json({ error: "forbidden" });

  const enrollments = await pbAdmin.collection("enrollments").getFullList({ filter: `class = "${classId}"` });
  const assignments = await pbAdmin.collection("assignments").getFullList({ filter: `class = "${classId}"` });

  const totalStudents = enrollments.length;
  const totalAssignments = assignments.length;

  const assignmentIds = assignments.map(a => a.id);
  let avgGrade = null;
  if (assignmentIds.length) {
    const subs = await pbAdmin.collection("submissions").getFullList({ filter: `assignment in ("${assignmentIds.join('","')}")` });
    const grades = subs.map(s => Number(s.grade)).filter(g => !isNaN(g));
    avgGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;
  }

  res.json({ classId, totalStudents, totalAssignments, avgGrade });
});

// เชื่อม routes อื่น (คงของเดิมไว้)
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import classesRoutes from './classes.js';
import assignmentsRoutes from './assignments.js';
import submissionsRoutes from './submissions.js';
import enrollmentsRoutes from './enrollments.js';
import meetingsRoutes from './meetings.js';
import debugRoutes from './debug.js';
import eventsRoutes from './events.js';
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/classes', classesRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/meetings', meetingsRoutes);
router.use('/events', eventsRoutes);
router.use('/debug', debugRoutes);

export default router;