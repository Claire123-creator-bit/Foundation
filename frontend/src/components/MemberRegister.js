import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function MemberRegister({ onBack }) {
  const [form, setForm] = useState({ full_names: '', national_id: '', phone_number: '', category: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const categories = ['Church Leader', 'Pastor', 'Village Elder', 'Agent', 'Youth Leader', 'Women Leader', 'Community Member', 'Government Official', 'NGO Representative', 'Volunteer'];

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API_BASE}/member-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(d => { setLoading(false); if (d.success) setDone(true); else setError(d.error || 'Failed. Try again.'); })
      .catch(() => { setLoading(false); setError('No connection. Try again.'); });
  };

  if (done) return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>✅</div>
        <h2 style={s.title}>Done!</h2>
        <p style={{ color: '#444', fontSize: 16, textAlign: 'center', marginBottom: 32, fontWeight: 300 }}>
          Your registration has been received.<br />Wait for admin to approve you.
        </p>
        <button style={s.btn} onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.box}>
        <button type="button" onClick={onBack} style={s.back}>← Back</button>
        <img src="/mbogo-background.jpeg" alt="logo" style={s.logo} />
        <h2 style={s.title}>Join Mbogo Foundation</h2>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} value={form.full_names} onChange={set('full_names')} placeholder="Your full name" required />

          <label style={s.label}>ID Number</label>
          <input style={s.input} value={form.national_id} onChange={set('national_id')} placeholder="National ID number" required />

          <label style={s.label}>Phone Number</label>
          <input style={s.input} value={form.phone_number} onChange={set('phone_number')} placeholder="07XXXXXXXX" type="tel" required />

          <label style={s.label}>Your Role</label>
          <select style={s.input} value={form.category} onChange={set('category')} required>
            <option value="">Select...</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Please wait...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  box:   { background: '#fff', padding: '40px 32px', width: '100%', maxWidth: 400, border: '2px solid #0A2463' },
  back:  { background: 'transparent', border: 'none', color: '#0A2463', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 20, width: 'auto', height: 'auto', fontWeight: 600 },
  logo:  { width: 70, height: 70, objectFit: 'cover', borderRadius: '50%', border: '3px solid #0A2463', display: 'block', margin: '0 auto 16px' },
  title: { color: '#0A2463', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 24 },
  label: { display: 'block', fontSize: 16, fontWeight: 600, color: '#0A2463', marginBottom: 8 },
  input: { width: '100%', padding: '14px', fontSize: 16, border: '2px solid #0A2463', color: '#0A2463', outline: 'none', marginBottom: 20, boxSizing: 'border-box' },
  error: { color: '#b00020', fontSize: 14, fontWeight: 600, marginBottom: 12, textAlign: 'center' },
  btn:   { width: '100%', height: 56, background: '#0A2463', color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer' },
};

export default MemberRegister;
