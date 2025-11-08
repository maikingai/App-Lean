import pb, { setAuthToken } from './pbClient';

// simple wrapper around fetch to call backend /api and include PB token
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('/api') ? path : `/api${path}`;
  const headers = new Headers(options.headers || {});
  // prefer pb.authStore token, fallback to localStorage
  const token = pb.authStore?.token || localStorage.getItem('pb_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // clear token on 401
    try { setAuthToken(null); } catch(e){}
  }
  return res;
}

export default apiFetch;
