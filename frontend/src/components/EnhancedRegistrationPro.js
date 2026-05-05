import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

const categories = ['Church Leader', 'Pastor', 'Village Elder', 'Agent', 'Youth Leader', 'Women Leader', 'Community Member', 'Government Official', 'NGO Representative', 'Volunteer'];

function RegisterMember({ onRegistrationSuccess }) {
  const [form, setForm] = useState({ full_names: '', national_id: '', phone_number: '', county: '', constituency: '', ward: '', physical_location: '', category: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    fetch(`${API_BASE}/register-member-pro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setLoading(false);
        if (ok) {
          setMsg('Member registered successfully!');
          setForm({ full_names: '', national_id: '', phone_number: '', county: '', constituency: '', ward: '', physical_location: '', category: '' });
        } else setError(data.error || 'Registration failed');
      })
      .catch(() => { setLoading(false); setError('Cannot connect to server'); });
  };

  return (
    <div>
      <h2>Register Member</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input value={form.full_names} onChange={set('full_names')} required />

        <label>National ID Number</label>
        <input value={form.national_id} onChange={set('national_id')} required />

        <label>Phone Number</label>
        <input value={form.phone_number} onChange={set('phone_number')} placeholder="07XXXXXXXX" required />

        <label>County</label>
        <input value={form.county} onChange={set('county')} required />

        <label>Constituency</label>
        <input value={form.constituency} onChange={set('constituency')} required />

        <label>Ward</label>
        <input value={form.ward} onChange={set('ward')} required />

        <label>Physical Location</label>
        <input value={form.physical_location} onChange={set('physical_location')} required />

        <label>Member Category</label>
        <select value={form.category} onChange={set('category')} required>
          <option value="">Select category...</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {msg   && <p className="msg-success">✅ {msg}</p>}
        {error && <p className="msg-error">❌ {error}</p>}

        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Member'}</button>
      </form>
    </div>
  );
}

export default RegisterMember;
