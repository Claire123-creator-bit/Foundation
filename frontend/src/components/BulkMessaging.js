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
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Send SMS to Members</h2>

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
          <form onSubmit={handleSend} style={s.form}>
            <div style={s.formGroup}>
              <label style={s.label}>Send To</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                style={s.input}
              >
                <option value=''>All approved members</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                placeholder='Type your message here...'
                style={{...s.textarea, height: 140, resize: 'vertical'}}
                maxLength={1000}
              />
            </div>

            <div style={s.counter}>
              <small>{message.length} characters</small>
              <small>{parts} SMS part{parts !== 1 ? 's' : ''} per recipient</small>
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button 
              type='submit' 
              disabled={loading || !message.trim()} 
              style={{...s.button, opacity: loading || !message.trim() ? 0.6 : 1}}
            >
              {loading ? 'Sending...' : `Send SMS${category ? ` to ${category}s` : ' to All Members'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: '100px 20px 60px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: '#fff',
    border: '2px solid #0A2463',
    borderRadius: '12px',
    padding: '40px 32px',
    boxShadow: '0 8px 24px rgba(10, 36, 99, 0.12)',
  },
  title: {
    color: '#0A2463',
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '32px',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0A2463',
  },
  input: {
    fontSize: '15px',
    padding: '12px 14px',
    border: '2px solid #0A2463',
    borderRadius: '8px',
    fontFamily: 'inherit',
    color: '#333',
    outline: 'none',
    backgroundColor: '#fff',
  },
  textarea: {
    fontSize: '15px',
    padding: '12px 14px',
    border: '2px solid #0A2463',
    borderRadius: '8px',
    fontFamily: 'inherit',
    color: '#333',
    outline: 'none',
    backgroundColor: '#fff',
  },
  counter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#666',
    marginTop: '-12px',
  },
  error: {
    background: '#ffebee',
    color: '#b00020',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    border: '1px solid #ef5350',
  },
  button: {
    fontSize: '16px',
    fontWeight: 700,
    padding: '14px 32px',
    height: '48px',
    border: 'none',
    borderRadius: '8px',
    background: '#0A2463',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '12px',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    background: '#e8f5e9',
    border: '2px solid #4caf50',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  successTitle: {
    fontWeight: 700,
    color: '#2e7d32',
    fontSize: '18px',
    margin: 0,
  },
  successSub: {
    fontWeight: 300,
    color: '#555',
    fontSize: '15px',
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
  resetBtn: {
    width: 'auto',
    padding: '10px 28px',
    background: '#0A2463',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s',
  },
};

export default BulkMessaging;
