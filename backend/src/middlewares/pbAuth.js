import PocketBase from 'pocketbase';

export default async function pbAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing Bearer token' });
    }
    const token = header.slice(7);
    const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
    pb.authStore.save(token, null);
    const { token: refreshed, record } = await pb.collection('users').authRefresh();
  // include first_name / last_name if available (PocketBase field names are snake_case)
  const first_name = record?.first_name || record?.data?.first_name || record?.firstName || null;
  const last_name = record?.last_name || record?.data?.last_name || record?.lastName || null;
  // compute a friendly display name: prefer first+last, else use record.name when not an email, else username, else email local-part
  let display_name = '';
  if (first_name || last_name) display_name = [first_name || '', last_name || ''].filter(Boolean).join(' ');
  else if (record?.name && !String(record.name).includes('@')) display_name = record.name;
  else if (record?.username) display_name = record.username;
  else if (record?.email) display_name = String(record.email).split('@')[0];
  else display_name = String(record?.id || '')

  req.user = { id: record?.id, email: record?.email, name: record?.name, first_name, last_name, display_name, avatar: record?.avatar, role: record?.role };
    res.locals.pbToken = refreshed;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}