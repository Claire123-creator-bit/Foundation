import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

const CATEGORIES = [
  'Church Leader', 'Pastor', 'Village Elder', 'Agent', 'Youth Leader',
  'Women Leader', 'Community Member', 'Government Official', 'NGO Representative', 'Volunteer',
];

function maskPhone(raw) {
  let v = raw.replace(/[^\d]/g, '');
  if (v.startsWith('254')) v = '0' + v.slice(3);
  return v.slice(0, 10);
}

function toE164(v) {
  const d = v.replace(/\D/g, '');
  return d.startsWith('0') && d.length === 10 ? '+254' + d.slice(1) : v;
}

function MemberRegister({ onBack, onLogin, onRegistered }) {
  const [form, setForm] = useState({
    full_names: '', national_id: '', phone: '',
    gender: '', county: '', constituency: '', ward: '', category: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = k => e => {
    const v = e.target.value;
    const next = { ...form, [k]: v };
    setForm(next);
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.full_names.trim()) e.full_names = 'Required';
    if (!/^\d+$/.test(form.national_id.trim())) e.national_id = 'Enter a valid ID number';
    if (!/^(07|01)\d{8}$/.test(form.phone)) e.phone = 'Enter a valid number e.g. 0712345678';
    if (!form.gender) e.gender = 'Required';
    if (!form.county) e.county = 'Required';
    if (!form.constituency) e.constituency = 'Required';
    if (!form.ward) e.ward = 'Required';
    if (!form.category) e.category = 'Required';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    fetch(`${API_BASE}/member-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_names: form.full_names.trim(),
        national_id: form.national_id.trim(),
        phone_number: toE164(form.phone),
        gender: form.gender,
        county: form.county,
        constituency: form.constituency,
        ward: form.ward,
        physical_location: form.ward,
        category: form.category,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setLoading(false);
        if (d.success) {
          if (onRegistered) onRegistered(null, d.member);
          else setDone(true);
        } else {
          setApiError(d.error || 'Registration failed. Try again.');
        }
      })
      .catch(() => { setLoading(false); setApiError('No connection. Try again.'); });
  };

  if (done) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.successIcon}>✓</div>
        <h2 style={s.title}>Application Received</h2>
        <p style={s.sub}>Your registration is under review. An admin will approve your account shortly.</p>
        <button style={s.btn} onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>

      <div style={s.card}>
        <button style={s.back} onClick={onBack}>← Back</button>
        <img src="/mbogo-background.jpeg" alt="Mbogo Foundation" style={s.logo} />
        <h2 style={s.title}>Join Mbogo Foundation</h2>
        <p style={s.sub}>Fill in your details to apply for membership.</p>

        <form onSubmit={handleSubmit} noValidate>

          <Field label="Full Name" error={errors.full_names}>
            <input style={inp(errors.full_names)} value={form.full_names} onChange={set('full_names')} placeholder="Your full name" />
          </Field>

          <Field label="National ID Number" error={errors.national_id}>
            <input style={inp(errors.national_id)} value={form.national_id} onChange={set('national_id')} placeholder="Enter your National ID Number" inputMode="numeric" />
          </Field>

          <Field label="Phone Number" error={errors.phone}>
            <input style={inp(errors.phone)} value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: maskPhone(e.target.value) })); setErrors(p => { const n={...p}; delete n.phone; return n; }); }} placeholder="07XXXXXXXX" type="tel" />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <select style={inp(errors.gender)} value={form.gender} onChange={set('gender')}>
              <option value="">Select…</option>
              <option>Male</option><option>Female</option><option value="Other">Prefer not to say</option>
            </select>
          </Field>

          <Field label="County" error={errors.county}>
            <input style={inp(errors.county)} value={form.county} onChange={set('county')} placeholder="Type your county" />
          </Field>

          <Field label="Constituency" error={errors.constituency}>
            <input style={inp(errors.constituency)} value={form.constituency} onChange={set('constituency')} placeholder="Type your constituency" />
          </Field>

          <Field label="Ward" error={errors.ward}>
            <input style={inp(errors.ward)} value={form.ward} onChange={set('ward')} placeholder="Type your ward" />
          </Field>

          <Field label="Your Role" error={errors.category}>
            <select style={inp(errors.category)} value={form.category} onChange={set('category')}>
              <option value="">Select role…</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          {apiError && <p style={s.err}>{apiError}</p>}

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Submitting…' : 'Register'}
          </button>
        </form>

        <p style={s.switchText}>
          Already have an account?{' '}
          <button type="button" style={s.link} onClick={onLogin}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 5 }}>{label}</label>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#DC2626' }}>{error}</p>}
    </div>
  );
}

const inp = err => ({
  width: '100%', padding: '11px 12px', fontSize: 15, boxSizing: 'border-box',
  border: `1.5px solid ${err ? '#DC2626' : '#CBD5E1'}`, borderRadius: 7,
  background: err ? '#FEF2F2' : '#fff', outline: 'none', fontFamily: 'inherit',
  color: '#1E293B',
});

const s = {
  page:        { minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' },
  card:        { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '36px 32px', width: '100%', maxWidth: 460, boxSizing: 'border-box' },
  back:        { background: 'none', border: 'none', color: '#0A2463', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 20 },
  logo:        { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid #0A2463', display: 'block', margin: '0 auto 14px' },
  title:       { fontSize: 20, fontWeight: 700, color: '#0A2463', textAlign: 'center', margin: '0 0 4px' },
  sub:         { fontSize: 13, color: '#64748B', textAlign: 'center', margin: '0 0 24px' },
  btn:         { width: '100%', height: 48, background: '#0A2463', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, marginBottom: 16 },
  err:         { color: '#DC2626', fontSize: 13, margin: '0 0 12px' },
  consentRow:  { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 },
  consentLabel:{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6 },
  link:        { background: 'none', border: 'none', color: '#0A2463', fontWeight: 600, fontSize: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  switchText:  { textAlign: 'center', fontSize: 13, color: '#64748B', margin: 0 },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 },
  modal:       { background: '#fff', borderRadius: 12, padding: '32px 28px', maxWidth: 480, width: '100%', position: 'relative', maxHeight: '80vh', overflowY: 'auto' },
  modalClose:  { position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748B' },
  modalText:   { fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 12 },
  successIcon: { width: 56, height: 56, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26, color: '#059669' },
};

export default MemberRegister;
