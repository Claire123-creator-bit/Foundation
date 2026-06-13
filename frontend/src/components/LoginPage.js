import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function LoginPage({ onLogin, onBack }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(d => {
        setLoading(false);
        if (d.success) {
          onLogin(d.name, d.username, d.role, d.token);
        } else {
          setError(d.message || 'Login failed');
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Cannot connect to server');
      });
  };


  return (
    <div style={s.page}>
      <div style={s.left}>
        <img src="/mbogo-background.jpeg" alt="Mbogo Foundation" style={{ width: 80, height: 80, objectFit: 'cover', marginBottom: 20, border: '3px solid #fff' }} />
        <h1 style={s.brand}>Mbogo Foundation</h1>
        <p style={s.tagline}>Empowering Communities Through Unity</p>
        <div style={s.line} />
        <p style={s.quote}>"Together we grow, together we thrive."</p>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.title}>Welcome back</h2>
            <p style={s.sub}>Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={form.username} onChange={set('username')} placeholder="Enter username" required />

            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input style={s.input} value={form.password} onChange={set('password')} type={show ? 'text' : 'password'} placeholder="Enter password" required />
              <button type="button" onClick={() => setShow(!show)} style={s.eye}>{show ? 'Hide' : 'Show'}</button>
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>


          </form>
        </div>
      </div>
    </div>
  );
}


const s = {
  page:      { display: 'flex', minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' },
  left:      { width: 320, background: 'rgba(10,36,99,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, flexShrink: 0 },
  brand:     { color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  tagline:   { color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center', fontWeight: 300, marginBottom: 28 },
  line:      { width: 40, height: 2, background: 'rgba(255,255,255,0.3)', marginBottom: 20 },
  quote:     { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', fontStyle: 'italic', fontWeight: 300 },
  right:     { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:      { background: '#fff', border: '2px solid #0A2463', width: '100%', maxWidth: 420 },
  cardHeader:{ background: '#0A2463', padding: '24px 32px' },
  title:     { color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 },
  sub:       { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 300 },
  form:      { padding: 32 },
  label:     { display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2463', marginBottom: 6 },
  input:     { width: '100%', padding: '12px 14px', fontSize: 14, border: '2px solid #0A2463', background: '#fff', color: '#0A2463', outline: 'none', marginBottom: 16, boxSizing: 'border-box' },
  eye:       { position: 'absolute', right: 12, top: 10, width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, padding: 0 },
  error:     { color: '#b00020', fontSize: 13, fontWeight: 600, marginBottom: 12 },
  btn:       { width: '100%', height: 48, background: '#0A2463', color: '#fff', border: '2px solid #0A2463', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12 },
};



export default LoginPage;
