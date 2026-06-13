import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';
import { authHeaders } from '../utils/auth';


const CATEGORIES = [
  'Church Leader', 'Pastor', 'Village Elder', 'Agent', 'Youth Leader',
  'Women Leader', 'Community Member', 'Government Official', 'NGO Representative', 'Volunteer',
];

function BulkMessaging() {
  const [message, setMessage]   = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setError('');
    fetch(`${API_BASE}/send-bulk-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ message, category }),
    })

      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setResult(data.recipients);
          setMessage('');
          setCategory('');
        } else {
          setError(data.error || 'Failed to send SMS');
        }
      })
      .catch(() => { setLoading(false); setError('Cannot connect to server'); });
  };

  const parts = Math.ceil(message.length / 160) || 1;

  return (
    <div>
      <h2>Send SMS to Members</h2>

      {result !== null && (
        <div style={s.successBox}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <p style={s.successTitle}>SMS Sent Successfully</p>
            <p style={s.successSub}>Queued to <strong>{result}</strong> member{result !== 1 ? 's' : ''}. Messages will arrive on their registered phone numbers shortly.</p>
          </div>
          <button style={s.resetBtn} onClick={() => setResult(null)}>Send Another</button>
        </div>
      )}

      {result === null && (
        <form onSubmit={handleSend}>
          <label>Send To</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value=''>All approved members</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder='Type your message here...'
            style={{ height: 140, resize: 'vertical' }}
            maxLength={1000}
          />
          <div style={s.counter}>
            <small>{message.length} characters</small>
            <small>{parts} SMS part{parts !== 1 ? 's' : ''} per recipient</small>
          </div>

          {error && <p className='msg-error' style={{ marginTop: 8 }}>{error}</p>}

          <button type='submit' disabled={loading || !message.trim()} style={{ marginTop: 8 }}>
            {loading ? 'Sending...' : `Send SMS${category ? ` to ${category}s` : ' to All Members'}`}
          </button>
        </form>
      )}
    </div>
  );
}

const s = {
  successBox:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: '#fff', border: '2px solid #0A2463', padding: 32, textAlign: 'center', marginBottom: 16 },
  successTitle: { fontWeight: 700, color: '#0A2463', fontSize: 16, margin: 0 },
  successSub:   { fontWeight: 300, color: '#444', fontSize: 14, margin: '4px 0 0' },
  resetBtn:     { width: 'auto', height: 40, padding: '0 24px', background: '#0A2463', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  counter:      { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
};

export default BulkMessaging;
