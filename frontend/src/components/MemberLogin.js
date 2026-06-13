import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';
import { storeToken } from '../utils/auth';


function MemberLogin({ onLogin, onBack }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API_BASE}/member-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone })
    })
      .then(r => r.json())
      .then(d => { setLoading(false); if (d.success) { storeToken(d.token); onLogin(d.member, d.token); } else setError(d.message); })
      .catch(() => { setLoading(false); setError('Cannot connect. Please try again.'); });


  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <button type="button" onClick={onBack} style={s.back}>← Back</button>

        <img src="/mbogo-background.jpeg" alt="logo" style={s.logo} />
        <h1 style={s.title}>Mbogo Foundation</h1>
        <p style={s.sub}>Enter your phone number to sign in</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={s.label}>Phone Number</label>
          <input
            style={s.input}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="07XXXXXXXX"
            type="tel"
            required
            autoFocus
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
        <p style={s.switchText}>Not registered yet? Contact your admin.</p>

      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  box:         { background: '#fff', border: '2px solid #0A2463', padding: '40px 32px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  back:        { alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#0A2463', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 20, width: 'auto', height: 'auto', fontWeight: 600 },
  logo:        { width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '3px solid #0A2463', marginBottom: 16 },
  title:       { color: '#0A2463', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  sub:         { color: '#666', fontSize: 16, fontWeight: 300, textAlign: 'center', marginBottom: 32 },
  label:       { display: 'block', fontSize: 16, fontWeight: 600, color: '#0A2463', marginBottom: 10, alignSelf: 'flex-start', width: '100%' },
  input:       { width: '100%', padding: '16px', fontSize: 22, border: '3px solid #0A2463', color: '#0A2463', outline: 'none', marginBottom: 20, boxSizing: 'border-box', textAlign: 'center', letterSpacing: 2 },
  errorBox:    { background: '#fff3f3', border: '2px solid #b00020', padding: 16, marginBottom: 16, width: '100%', boxSizing: 'border-box' },
  errorText:   { color: '#b00020', fontSize: 15, fontWeight: 600, textAlign: 'center', margin: 0 },
  btn:         { width: '100%', height: 60, background: '#0A2463', color: '#fff', border: 'none', fontSize: 20, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  googleBtn:  { width: '100%', height: 60, background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4, fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 24 },

  divider:     { width: '100%', height: 1, background: '#ddd', marginBottom: 20 },
  switchText:  { color: '#666', fontSize: 15, fontWeight: 300, marginBottom: 12, textAlign: 'center' },
};

export default MemberLogin;
