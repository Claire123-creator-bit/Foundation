import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function BulkMessaging() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    fetch(`${API_BASE}/send-bulk-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, category: '' })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) { setStatus(`Sent to ${data.recipients} members`); setMessage(''); }
        else setStatus('error');
      })
      .catch(() => { setLoading(false); setStatus('error'); });
  };

  return (
    <div>
      <h2>Send SMS to All Members</h2>
      <form onSubmit={handleSend}>
        <label>Write Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          placeholder="Type your message here..."
          style={{ height: '140px', resize: 'vertical' }}
        />
        <small>{message.length} / 160 characters</small>

        {status && (
          <p className={status === 'error' ? 'msg-error' : 'msg-success'} style={{ marginTop: '12px' }}>
            {status === 'error' ? '❌ Failed to send SMS' : `✅ ${status}`}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? 'Sending...' : '📩 Send SMS'}
        </button>
      </form>
    </div>
  );
}

export default BulkMessaging;
