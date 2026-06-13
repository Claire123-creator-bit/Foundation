import API_BASE from './apiConfig';

export function getToken() {
  return localStorage.getItem('token');
}

// Backward compatible alias (required by audit)
export const setTokenTo = storeToken;


export function storeToken(token) {
  if (!token) localStorage.removeItem('token');
  else localStorage.setItem('token', token);
}

// Backward compatible alias
export function setToken(token) {
  storeToken(token);
}


export function clearNonTokenAuthState() {
  // kept for backward compatibility with older google flow
  localStorage.removeItem('adminUsername');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('pending_token');
}


export function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function me() {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw data;
  return data;
}

