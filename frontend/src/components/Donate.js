import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function Donate() {
  const [form, setForm] = useState({ phone: '', amount: '', name: '', type: 'Donation' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const types = ['Donation', 'Contribution', 'Welfare Fund'];
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    fetch(`${API_BASE}/mpesa-stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) setStatus('success');
        else setStatus(data.error || 'Payment failed. Please try again.');
      })
      .catch(() => { setLoading(false); setStatus('error'); });
  };

  if (status === 'success') {
    return (
      <div style={s.successBox}>
        <div style={s.successIcon}></div>
        <h2 style={{ color: '#0A2463', marginBottom: 8 }}>Request Sent!</h2>
        <p style={{ color: '#444', marginBottom: 24 }}>
          Check your phone <strong>{form.phone}</strong> for an M-Pesa prompt.<br />
          Enter your PIN to complete the payment of <strong>KES {form.amount}</strong>.
        </p>
        <button style={s.btn} onClick={() => { setStatus(''); setForm({ phone: '', amount: '', name: '', type: 'Donation' }); }}>
          Make Another Payment
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Make a Payment</h2>
      <p style={{ marginBottom: 24, fontWeight: 300 }}>Payments are processed securely via M-Pesa.</p>

      {/* M-Pesa badge */}
      <div style={s.mpesaBadge}>
        <div style={s.mpesaLogo}>M-PESA</div>
        <div>
          <p style={{ fontWeight: 600, color: '#0A2463', fontSize: 14 }}>Lipa Na M-Pesa</p>
          <p style={{ fontWeight: 300, color: '#666', fontSize: 12 }}>STK Push — you'll receive a prompt on your phone</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input value={form.name} onChange={set('name')} placeholder="Your full name" required />

        <label>M-Pesa Phone Number</label>
        <input value={form.phone} onChange={set('phone')} placeholder="07XXXXXXXX or 2547XXXXXXXX" required />

        <label>Payment Type</label>
        <select value={form.type} onChange={set('type')}>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Amount (KES)</label>
        {/* Quick amount buttons */}
        <div style={s.quickAmounts}>
          {quickAmounts.map(a => (
            <button key={a} type="button"
              style={{ ...s.quickBtn, ...(form.amount === String(a) ? s.quickBtnActive : {}) }}
              onClick={() => setForm({ ...form, amount: String(a) })}>
              {a.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          value={form.amount}
          onChange={set('amount')}
          placeholder="Or enter custom amount"
          type="number"
          min="1"
          required
        />

        {status === 'error' && (
          <p className="msg-error">Cannot connect to server. Please try again.</p>
        )}
        {status && status !== 'error' && status !== 'success' && (
          <p className="msg-error">{status}</p>
        )}

        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Processing...' : 'Pay with M-Pesa'}
        </button>
      </form>
    </div>
  );
}

const s = {
  mpesaBadge: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '2px solid #0A2463', padding: 16, marginBottom: 24 },
  mpesaLogo:  { background: '#4CAF50', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 12px', flexShrink: 0 },
  quickAmounts: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  quickBtn: { width: 'auto', height: 36, padding: '0 16px', background: '#fff', color: '#0A2463', border: '2px solid #0A2463', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 4 },
  quickBtnActive: { background: '#0A2463', color: '#fff' },
  btn: { width: '100%', height: 50, background: '#0A2463', color: '#fff', border: '2px solid #0A2463', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  successBox: { textAlign: 'center', padding: '60px 24px', background: '#fff', border: '2px solid #0A2463' },
  successIcon: { fontSize: 56, marginBottom: 16 },
};

export default Donate;
