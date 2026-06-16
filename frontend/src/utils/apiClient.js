import API_BASE from './apiConfig';
import { setToken, clearNonTokenAuthState, authHeaders } from './auth';

function redirectToLogin() {
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
    setToken(null);
    clearNonTokenAuthState();
    redirectToLogin();
    throw data || { success: false, message: 'Unauthorized' };
  }

  return data ?? {};
}

