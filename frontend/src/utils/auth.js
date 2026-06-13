import API_BASE from './apiConfig';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (!token) localStorage.removeItem('token');
  else localStorage.setItem('token', token);
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

