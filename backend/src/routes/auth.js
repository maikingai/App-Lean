import express from 'express';
import PocketBase from 'pocketbase';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
  const { email, password, firstName, lastName, role } = req.body || {};
  // allow missing lastName (users may enter single-word names). Require at least email, password and firstName
  if (!email || !password || !firstName) return res.status(400).json({ success: false, message: 'Missing required fields (email, password, firstName)' });
  const name = `${firstName} ${lastName || ''}`.trim();
    try {
      // check if email already exists
      try {
        const existing = await pbAdmin.collection('users').getList(1, 1, { filter: `email = "${email}"` });
        if (existing && existing.total && existing.total > 0) {
          return res.status(409).json({ success: false, message: 'Email already in use' });
        }
      } catch (qErr) {
        // ignore query error and proceed to create (we'll catch create error below)
        console.warn('email existence check failed:', String(qErr));
      }

  // attempt to create user using admin client
  // include role when provided so frontend role selection is persisted in PB
  // also persist first_name / last_name on the record (PocketBase field names are snake_case)
  const createPayload = { email, password, passwordConfirm: password, name };
  if (role) createPayload.role = role;
  if (firstName) createPayload.first_name = firstName;
  if (lastName) createPayload.last_name = lastName;
  await pbAdmin.collection('users').create(createPayload);
    } catch (createErr) {
      // log detailed error for debugging
      try {
        console.error('pbAdmin create user error:', createErr);
        if (createErr?.response) {
          console.error('pbAdmin create user error response:', JSON.stringify(createErr.response, null, 2));
        }
      } catch (logErr) {
        console.error('error logging createErr failed:', String(logErr));
      }
      // try to extract PocketBase error details (return full data object when available for easier debugging)
      const pbData = createErr?.response?.data;
      const pbMsg = (pbData && (pbData.message || JSON.stringify(pbData))) || createErr?.message || String(createErr);
      return res.status(400).json({ success: false, message: pbMsg || 'Failed to create user', pbError: pbData || null });
    }

  const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
  const authData = await pb.collection('users').authWithPassword(email, password);
  // include role and first/last name if present in the PocketBase record
  const userRole = authData?.record?.role || authData?.record?.data?.role || null;
  const first_name = authData?.record?.first_name || authData?.record?.data?.first_name || null;
  const last_name = authData?.record?.last_name || authData?.record?.data?.last_name || null;
  // compute display_name similarly to pbAuth middleware
  let display_name = ''
  if (first_name || last_name) display_name = [first_name || '', last_name || ''].filter(Boolean).join(' ')
  else if (authData?.record?.name && !String(authData.record.name).includes('@')) display_name = authData.record.name
  else if (authData?.record?.username) display_name = authData.record.username
  else if (authData?.record?.email) display_name = String(authData.record.email).split('@')[0]
  else display_name = authData?.record?.id || ''

  res.status(201).json({ success: true, message: 'Registered successfully', token: authData?.token, user: { id: authData?.record?.id, email: authData?.record?.email, name: authData?.record?.name, first_name, last_name, display_name, avatar: authData?.record?.avatar ?? null, role: userRole } });
  } catch (e) {
    res.status(400).json({ success: false, message: e?.message || 'Register failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email or password' });
  const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
  const authData = await pb.collection('users').authWithPassword(email, password);
  const userRole = authData?.record?.role || authData?.record?.data?.role || null;
  const first_name = authData?.record?.first_name || authData?.record?.data?.first_name || null;
  const last_name = authData?.record?.last_name || authData?.record?.data?.last_name || null;
  let display_name_login = ''
  if (first_name || last_name) display_name_login = [first_name || '', last_name || ''].filter(Boolean).join(' ')
  else if (authData?.record?.name && !String(authData.record.name).includes('@')) display_name_login = authData.record.name
  else if (authData?.record?.username) display_name_login = authData.record.username
  else if (authData?.record?.email) display_name_login = String(authData.record.email).split('@')[0]
  else display_name_login = authData?.record?.id || ''

  res.json({ success: true, message: 'Login successful', token: authData?.token, user: { id: authData?.record?.id, email: authData?.record?.email, name: authData?.record?.name, first_name, last_name, display_name: display_name_login, avatar: authData?.record?.avatar ?? null, role: userRole } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

router.get('/me', pbAuth, (req, res) => res.json({ success: true, user: req.user, token: res.locals.pbToken }));
router.post('/logout', (_req, res) => res.json({ success: true, message: 'Logout: remove token on client' }));

export default router;