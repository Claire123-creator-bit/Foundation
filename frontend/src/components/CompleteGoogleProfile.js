import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function CompleteGoogleProfile({ onComplete, onBack }) {
  const [form, setForm] = useState({ phone_number: '', national_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('pending_token');
      if (!token) throw new Error('Missing pending token. Please login again.');



      const res = await fetch(`${API_BASE}/auth/google/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number: form.phone_number,
          national_id: form.national_id,
        }),
      });

      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.message || 'Completion failed');

      // API returns { success: true, token: <jwt> }
      localStorage.setItem('token', d.token);
      localStorage.removeItem('pending_token');
      onComplete?.(d.token);

    } catch (e2) {
      setError(e2?.message || 'Failed to complete profile');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <button type="button" onClick={onBack} style={s.back}>
          ← Back
        </button>

        <img src="/mbogo-background.jpeg" alt="logo" style={s.logo} />
        <h1 style={s.title}>Complete your profile</h1>
        <p style={s.sub}>Add your phone number and national ID to finish signing in.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={s.label}>Phone Number</label>
          <input
            style={s.input}
            value={form.phone_number}
            onChange={set('phone_number')}
            placeholder="07XXXXXXXX"
            type="tel"
            required
            autoFocus
          />

          <label style={s.label}>National ID</label>
          <input
            style={s.input}
            value={form.national_id}
            onChange={set('national_id')}
            placeholder="Enter national ID"
            type="text"
            inputMode="numeric"
            required
          />

          {error && (
            <div style={s.errorBox}>
              <p style={s.errorText}>{error}</p>
            </div>
          )}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    backgroundImage: 'url(/mbogo-background.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    background: '#fff',
    border: '2px solid #0A2463',
    padding: '40px 32px',
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  back: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: '#0A2463',
    fontSize: 14,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 20,
    width: 'auto',
    height: 'auto',
    fontWeight: 600,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: '50%',
    border: '3px solid #0A2463',
    marginBottom: 16,
  },
  title: { color: '#0A2463', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  sub: { color: '#666', fontSize: 16, fontWeight: 300, textAlign: 'center', marginBottom: 28 },
  label: {
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    color: '#0A2463',
    marginBottom: 10,
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 6,
  },
  input: {
    width: '100%',
    padding: '16px',
    fontSize: 18,
    border: '3px solid #0A2463',
    color: '#0A2463',
    outline: 'none',
    marginBottom: 18,
    boxSizing: 'border-box',
    textAlign: 'center',
    letterSpacing: 1,
  },
  errorBox: { background: '#fff3f3', border: '2px solid #b00020', padding: 16, marginBottom: 16, width: '100%', boxSizing: 'border-box' },
  errorText: { color: '#b00020', fontSize: 15, fontWeight: 600, textAlign: 'center', margin: 0 },
  btn: { width: '100%', height: 60, background: '#0A2463', color: '#fff', border: 'none', fontSize: 20, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
};

export default CompleteGoogleProfile;

