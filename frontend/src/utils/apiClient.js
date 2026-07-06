import API_BASE from './apiConfig';
import { setToken, clearNonTokenAuthState, authHeaders, authHeadersNoContentType } from './auth';

function redirectToLogin() {
  window.location.href = '/';
}

export async function apiFetch(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? authHeadersNoContentType() : authHeaders()),
    ...(options.headers || {}),
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
