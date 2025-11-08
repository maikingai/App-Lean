const express = require('express');
const router = express.Router();
const pb = require('../pbAdminClient'); // ใช้ client ที่มีอยู่แล้ว (admin) สะดวกสำหรับสร้าง user
const PocketBase = require('pocketbase');

// POST /api/auth/register
// สร้างผู้ใช้ใหม่ใน collection "users"
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const name = `${firstName} ${lastName}`.trim();

    // สร้าง user ใหม่
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
    });

    // ให้ user สามารถล็อกอินได้ทันที
    const publicPb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');
    const authData = await publicPb.collection('users').authWithPassword(email, password);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token: authData?.token,
      user: {
        id: authData?.record?.id || user?.id,
        email: authData?.record?.email || email,
        name: authData?.record?.name || name,
        avatar: authData?.record?.avatar || null,
      },
    });
  } catch (err) {
    // ข้อความ error จาก PB จะอยู่ใน err.message
    return res.status(400).json({ success: false, message: err?.message || 'Register failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const publicPb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');
    const authData = await publicPb.collection('users').authWithPassword(email, password);

    return res.json({
      success: true,
      message: 'Login successful',
      token: authData?.token,
      user: {
        id: authData?.record?.id,
        email: authData?.record?.email,
        name: authData?.record?.name,
        avatar: authData?.record?.avatar,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middlewares/pbAuth'), async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    // ส่ง token ที่รีเฟรชแล้วกลับไปด้วย (ถ้ามี)
    token: res.locals.pbToken || undefined,
  });
});

// POST /api/auth/logout (client แค่ลบทิ้ง token ฝั่งตนเอง)
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logout: remove token on client' });
});

module.exports = router;