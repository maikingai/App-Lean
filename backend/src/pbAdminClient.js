import PocketBase from 'pocketbase';

// Create a PocketBase client used for admin operations.
// The backend will try to authenticate automatically if PB_ADMIN_EMAIL/PB_ADMIN_PASS are set in env.
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

const adminEmail = process.env.PB_ADMIN_EMAIL;
const adminPass = process.env.PB_ADMIN_PASS;

if (adminEmail && adminPass) {
	// authenticate in background; this sets pb.authStore with admin token if successful
	console.log('[pbAdminClient] attempting admin auth', { baseUrl: pb.baseUrl, adminEmail });
	try {
		const authUrl = `${pb.baseUrl.replace(/\/$/, '')}/api/admins/auth-with-password`;
		console.log('[pbAdminClient] admin auth URL:', authUrl);
	} catch (e) {
		console.warn('[pbAdminClient] failed to compute admin auth URL', e?.message || e);
	}

		// Some PocketBase SDK versions try internal collection paths (e.g. _superusers)
		// which can cause 404. Do the admin auth via a direct POST to the admin API
		// and then save the token into pb.authStore so pb is authenticated.
		(async () => {
			try {
				const authUrl = `${pb.baseUrl.replace(/\/$/, '')}/api/admins/auth-with-password`;
				const res = await fetch(authUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ identity: adminEmail, password: adminPass }),
				});
				const data = await res.json().catch(() => null);
				if (!res.ok) {
					const msg = (data && (data.message || JSON.stringify(data))) || `status ${res.status}`;
					throw new Error(msg);
				}
				// expected data: { token: '...', record: { ... } }
				const token = data?.token || data?.auth?.token || data?.data?.token;
				const record = data?.record || data?.admin || data?.data || null;
				if (!token) {
					throw new Error('no token returned from admin auth');
				}
				// save token + model into authStore
				try {
					pb.authStore.save(token, record);
				} catch (e) {
					// fallback: save only token
					try { pb.authStore.save(token); } catch (e2) { /* ignore */ }
				}
				console.log('[pbAdminClient] authenticated as admin (manual)');
			} catch (err) {
				console.warn('[pbAdminClient] admin auth failed - manual:', err?.message || err);
			}
		})();
} else {
	console.warn('[pbAdminClient] PB_ADMIN_EMAIL/PB_ADMIN_PASS not set — creating users will fail (Only admins can perform this action).');
}

export default pb;