import API_BASE from './apiConfig';
import { getToken, setToken, clearNonTokenAuthState, authHeaders } from './auth';

function redirectToLogin() {
  // Hard reload keeps logic simple and avoids stale state.
  window.location.href = '/';
}

export async function apiFetch(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

  const headers = {
    ...(options.headers || {}),
    ...authHeaders(),
  };

  const opts = {
    ...options,
    headers,
  };

  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // ignore non-json
  }

  if (res.status === 401) {
    // token invalid/expired
    setToken(null);
    clearNonTokenAuthState();
    redirectToLogin();
    throw data || { success: false, message: 'Unauthorized' };
  }

  return data ?? {};
}

