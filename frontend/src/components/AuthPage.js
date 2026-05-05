import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.logoBox}>M</div>
        <h1 style={styles.brand}>Mbogo Foundation</h1>
        <p style={styles.tagline}>Empowering Communities Through Unity</p>
        <div style={styles.dividerLine} />
        <p style={styles.quote}>"Together we grow, together we thrive."</p>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button type="button" style={{ ...styles.tab, ...(mode === 'login'  ? styles.tabActive : {}) }} onClick={() => setMode('login')}>Login</button>
            <button type="button" style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

          {mode === 'login'  && <LoginForm  onLogin={onLogin} onSwitch={() => setMode('signup')} />}
          {mode === 'signup' && <SignupForm onLogin={onLogin} onSwitch={() => setMode('login')} />}
        </div>
      </div>
    </div>
  );
}

/* ── Login Form ── */
function LoginForm({ onLogin, onSwitch }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API_BASE}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(d => { setLoading(false); if (d.success) onLogin(d.name); else setError(d.message); })
      .catch(() => { setLoading(false); setError('Cannot connect to server'); });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.formTitle}>Welcome back</h2>
      <p style={styles.formSub}>Sign in to your admin account</p>

      <Field label="Username" value={form.username} onChange={set('username')} placeholder="Enter username" />
      <div style={{ position: 'relative' }}>
        <Field label="Password" value={form.password} onChange={set('password')} type={show ? 'text' : 'password'} placeholder="Enter password" />
        <button type="button" onClick={() => setShow(!show)} style={styles.eyeBtn}>{show ? '🙈' : '👁️'}</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" style={styles.submitBtn} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <Divider />
      <GoogleBtn label="Continue with Google" />

      <p style={{ ...styles.switchText, marginTop: 16 }}>
        Don't have an account?{' '}
        <span style={styles.link} onClick={onSwitch}>Sign up</span>
      </p>
    </form>
  );
}

/* ── Signup Form ── */
function SignupForm({ onLogin, onSwitch }) {
  const [form, setForm]     = useState({ full_name: '', username: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    fetch(`${API_BASE}/admin-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: form.full_name, username: form.username, email: form.email, phone: form.phone, password: form.password })
    })
      .then(r => r.json())
      .then(d => {
        setLoading(false);
        if (d.success) {
          // Auto login after signup
          fetch(`${API_BASE}/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: form.username, password: form.password })
          }).then(r => r.json()).then(d2 => { if (d2.success) onLogin(d2.name); });
        } else setError(d.message);
      })
      .catch(() => { setLoading(false); setError('Cannot connect to server'); });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.formTitle}>Create account</h2>
      <p style={styles.formSub}>Set up your admin account</p>

      <div style={styles.row}>
        <Field label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
        <Field label="Username"  value={form.username}  onChange={set('username')}  placeholder="Choose username" />
      </div>
      <div style={styles.row}>
        <Field label="Email"  value={form.email}  onChange={set('email')}  type="email" placeholder="your@email.com" />
        <Field label="Phone"  value={form.phone}  onChange={set('phone')}  placeholder="07XXXXXXXX" />
      </div>
      <div style={styles.row}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Field label="Password" value={form.password} onChange={set('password')} type={show ? 'text' : 'password'} placeholder="Min 6 characters" />
          <button type="button" onClick={() => setShow(!show)} style={styles.eyeBtn}>{show ? '🙈' : '👁️'}</button>
        </div>
        <Field label="Confirm Password" value={form.confirm} onChange={set('confirm')} type={show ? 'text' : 'password'} placeholder="Repeat password" />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" style={styles.submitBtn} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <Divider />
      <GoogleBtn label="Sign up with Google" />

      <p style={{ ...styles.switchText, marginTop: 16 }}>
        Already have an account?{' '}
        <span style={styles.link} onClick={onSwitch}>Sign in</span>
      </p>
    </form>
  );
}

/* ── Shared components ── */
function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} value={value} onChange={onChange} type={type} placeholder={placeholder} required />
    </div>
  );
}

function GoogleBtn({ label }) {
  return (
    <button type="button" style={styles.googleBtn}
      onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
      <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#ddd' }} />
      <span style={{ color: '#999', fontSize: 12 }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#ddd' }} />
    </div>
  );
}

/* ── Styles ── */
const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#F4F6FB' },

  // Left panel
  left: { width: 340, background: '#0A2463', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, flexShrink: 0 },
  logoBox: { width: 64, height: 64, background: '#fff', color: '#0A2463', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, marginBottom: 20 },
  brand: { color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  tagline: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', fontWeight: 300, marginBottom: 32 },
  dividerLine: { width: 40, height: 2, background: 'rgba(255,255,255,0.3)', marginBottom: 24 },
  quote: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', fontStyle: 'italic', fontWeight: 300 },

  // Right panel
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: '#fff', border: '2px solid #0A2463', width: '100%', maxWidth: 560 },

  // Tabs
  tabs: { display: 'flex', borderBottom: '2px solid #0A2463' },
  tab: { flex: 1, height: 48, border: 'none', background: '#fff', color: '#0A2463', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' },
  tabActive: { background: '#0A2463', color: '#fff' },

  // Form
  form: { padding: 32 },
  formTitle: { fontSize: 20, fontWeight: 700, color: '#0A2463', marginBottom: 4 },
  formSub: { fontSize: 13, fontWeight: 300, color: '#666', marginBottom: 24 },
  row: { display: 'flex', gap: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2463', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', fontSize: 14, border: '2px solid #0A2463', background: '#fff', color: '#0A2463', outline: 'none', marginBottom: 16, boxSizing: 'border-box', transition: 'background 0.15s' },
  eyeBtn: { position: 'absolute', right: 12, top: 34, width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, padding: 0 },
  error: { color: '#b00020', fontSize: 13, fontWeight: 600, marginBottom: 12 },
  submitBtn: { width: '100%', height: 48, background: '#0A2463', color: '#fff', border: '2px solid #0A2463', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s, color 0.15s', marginBottom: 16 },
  switchText: { textAlign: 'center', fontSize: 13, color: '#666', fontWeight: 300 },
  link: { color: '#0A2463', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' },
  googleBtn: { width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid #0A2463', color: '#0A2463', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' },
};

export default AuthPage;
