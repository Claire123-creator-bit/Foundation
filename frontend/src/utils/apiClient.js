import API_BASE from './apiConfig';
import { setToken, clearNonTokenAuthState, authHeaders } from './auth';

function redirectToLogin() {
  window.location.href = '/';
}

export async function apiFetch(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

  const headers = {
    ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...authHeaders(),
  };

  const res = await fetch(url, { ...options, headers });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {}

  if (res.status === 401) {
    setToken(null);
    clearNonTokenAuthState();
    redirectToLogin();
    throw data || { success: false, message: 'Unauthorized' };
  }

  return data ?? {};
}
