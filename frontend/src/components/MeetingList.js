import React, { useEffect, useState } from 'react';
import API_BASE from '../utils/apiConfig';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Role': 'admin' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMeetings(prev => [data.meeting, ...prev]);
          setForm({ title: '', date: '', time: '', venue: '' });
          setShowForm(false);
          setMsg('Meeting added successfully!');
        } else setMsg(data.error || 'Imeshindwa');
      })
      .catch(() => setMsg('Cannot connect to server'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Meetings</h2>
        <button className="small" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Meeting'}
        </button>
      </div>

      {msg && <p className="msg-success" style={{ marginBottom: '16px' }}>✅ {msg}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate}>
            <label>Meeting Title</label>
            <input value={form.title} onChange={set('title')} required />

            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} required />

            <label>Time</label>
            <input type="time" value={form.time} onChange={set('time')} required />

            <label>Venue</label>
            <input value={form.venue} onChange={set('venue')} placeholder="e.g. Church, Office..." />

            <button type="submit">Save</button>
          </form>
        </div>
      )}

      {meetings.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', fontWeight: 300 }}>No meetings scheduled yet.</p>
      )}
      {meetings.map(m => (
        <div key={m.id} className="card">
          <h3>{m.title}</h3>
          <p>📅 {m.date} &nbsp; 🕐 {m.time}</p>
          {m.venue && <p>📍 {m.venue}</p>}
        </div>
      ))}
    </div>
  );
}

export default MeetingList;
