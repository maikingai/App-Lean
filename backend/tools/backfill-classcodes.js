import pbAdmin from '../src/pbAdminClient.js';

async function waitForAdminAuth(pb, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (pb && pb.authStore && !!pb.authStore.isValid) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return false;
}

async function genCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  try {
    // wait a short time for pbAdmin to perform manual admin auth (pbAdminClient authenticates async)
    const ok = await waitForAdminAuth(pbAdmin, 8000);
    if (!ok) console.warn('[backfill] pbAdmin did not authenticate within timeout - will still try and may fail');
    const all = await pbAdmin.collection('classes').getFullList();
    console.log(`Found ${all.length} classes`);
    for (const c of all) {
      // skip if already has `code` field
      if (c.code) continue;
      let code = await genCode(6);
      // naive collision check against `code` field
      const exists = await pbAdmin.collection('classes').getList(1, 1, { filter: `code = "${code}"` }).catch(() => ({ totalItems: 0 }));
      if (exists && exists.totalItems) code = await genCode(8);
      try {
        const updated = await pbAdmin.collection('classes').update(c.id, { code: code });
        console.log(`Updated ${c.id} -> ${code}`);
      } catch (err) {
        console.warn('Failed to update', c.id, err.message || err);
      }
    }
    console.log('Done');
  } catch (e) {
    console.error('Error', e);
  }
}

main().catch(e => { console.error(e); process.exit(1) });
