import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function BulkMessaging({ userRole, userId }) {
  if (userRole !== 'admin') {
    return (
      <div className="form-container" style={{textAlign: 'center', padding: '50px'}}>
        <h2 style={{color: '#0A2463'}}>Access Denied</h2>
        <p style={{color: '#0A2463'}}>You do not have permission to view this page.</p>
        <p style={{color: '#0A2463', fontSize: '14px'}}>Only administrators can send bulk SMS.</p>
      </div>
    );
  }

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/members/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.log('Backend offline'));
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    const confirmSend = window.confirm(
      `Send SMS to ${selectedCategory || 'ALL'} members?\n\nMessage: "${message}"\n\nThis will automatically send SMS to all registered phone numbers.`
    );
    
    if (confirmSend) {
      fetch(`${API_BASE}/send-bulk-sms`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          category: selectedCategory,
          message: message
        })
      })
        .then(res => res.json())
        .then(data => {
          alert(`SMS sent successfully to ${data.recipients} members!\n\nDelivery Status: ${data.status}\nSent at: ${new Date().toLocaleString()}`);
          setMessage('');
        })
        .catch(err => alert('Error sending SMS: ' + err.message));
    }
  };

  return (
    <div className="form-container">
      <h2 className="page-title">SMS Broadcast System</h2>
      <p style={{textAlign: 'center', color: '#0A2463', marginBottom: '30px'}}>Send instant SMS updates to all registered members</p>
      <form onSubmit={handleSend}>
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A2463'}}>Target Audience:</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{width: '100%'}}>
            <option value="">All Members (Broadcast to Everyone)</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat} Members Only</option>)}
          </select>
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A2463'}}>Message Content:</label>
          <textarea 
            placeholder="Type your message here... (e.g., Meeting tomorrow at 2PM, venue: Community Hall)" 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            required
            style={{width: '100%', height: '120px', resize: 'vertical'}}
          />
          <small style={{color: '#0A2463'}}>Characters: {message.length}/160</small>
        </div>
        <button type="submit" style={{
          background: '#0A2463',
          padding: '15px 30px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px'
        }}>Send SMS to All Members</button>
      </form>
    </div>
  );
}

export default BulkMessaging;

