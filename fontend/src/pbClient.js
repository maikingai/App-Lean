import PocketBase from 'pocketbase';

// Frontend PocketBase client. Use Vite env variable VITE_POCKETBASE_URL to override.
const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(PB_URL);

// helper to persist token both in pb authStore and localStorage
export function setAuthToken(token) {
	try {
		if (token) {
			pb.authStore.save(token, null);
			localStorage.setItem('pb_token', token);
		} else {
			pb.authStore.clear();
			localStorage.removeItem('pb_token');
		}
	} catch (e) {
		// ignore
	}
}

// initialize from localStorage if available
try {
	const t = localStorage.getItem('pb_token');
	if (t) pb.authStore.save(t, null);
} catch (e) {}

export default pb;
