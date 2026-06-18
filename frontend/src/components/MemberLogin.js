import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';


function MemberLogin({ onLogin, onBack, onRegister }) {
  const [phone, setPhone] = useState('');
  const [national_id, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API_BASE}/member-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, national_id: national_id })
    })
      .then(r => r.json())
      .then(d => { setLoading(false); if (d.success) { onLogin(d.token); } else setError(d.error || d.message); })
      .catch(() => { setLoading(false); setError('Cannot connect. Please try again.'); });


  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <button type="button" onClick={onBack} style={s.back}>← Back</button>

        <img src="/mbogo-background.jpeg" alt="logo" style={s.logo} />
        <h1 style={s.title}>Mbogo Foundation</h1>
        <p style={s.sub}>Sign in with your credentials</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={s.label}>National ID</label>
          <input
            style={s.input}
            value={national_id}
            onChange={e => setNationalId(e.target.value)}
            placeholder="Your ID number"
            type="text"
            required
            autoFocus
          />

          <label style={s.label}>Phone Number</label>
          <input
            style={s.input}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="07XXXXXXXX"
            type="tel"
            required
          />

          {error && (
            <div style={s.errorBox}>
              <p style={s.errorText}>{error}</p>
            </div>
          )}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In'}
          </button>

          <button
            type="button"
            style={s.googleBtn}
            onClick={() => {
              window.location.href = `${API_BASE}/auth/google/login`;
            }}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>

        <div style={s.divider} />
        <p style={s.switchText}>
          Don't have an account?{' '}
          <button type="button" onClick={onRegister} style={s.switchLink}>
            Register here
          </button>
        </p>

      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  box:         { background: '#fff', border: '2px solid #0A2463', padding: '40px 32px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  back:        { alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#0A2463', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 20, width: 'auto', height: 'auto', fontWeight: 600 },
  logo:        { width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '3px solid #0A2463', marginBottom: 16 },
  title:       { color: '#0A2463', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8, marginTop: 0 },
  sub:         { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 24, fontWeight: 400 },
  label:       { display: 'block', fontSize: 14, fontWeight: 600, color: '#0A2463', marginBottom: 8, width: '100%', textAlign: 'left' },
  input:       { width: '100%', padding: '14px', fontSize: 14, border: '2px solid #0A2463', color: '#0A2463', outline: 'none', marginBottom: 20, boxSizing: 'border-box' },
  btn:         { width: '100%', height: 48, background: '#0A2463', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  googleBtn:   { width: '100%', height: 48, background: '#fff', color: '#0A2463', border: '2px solid #0A2463', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20 },
  errorBox:    { background: '#ffebee', padding: 12, marginBottom: 16, borderRadius: 4, border: '1px solid #ef5350' },
  errorText:   { color: '#b00020', margin: 0, fontSize: 14, fontWeight: 500 },
  divider:     { width: '100%', height: 1, background: '#ddd', margin: '20px 0' },
  switchText:  { color: '#666', fontSize: 14, textAlign: 'center', margin: 0, fontWeight: 400 },
  switchLink:  { background: 'none', border: 'none', color: '#0A2463', cursor: 'pointer', fontWeight: 700, fontSize: 14, textDecoration: 'underline', padding: 0, marginLeft: 4 },
};

export default MemberLogin;
