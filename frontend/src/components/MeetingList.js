import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiClient';


function MeetingList() {

  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiFetch('/meetings')
      .then(data => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({ title: '', date: '', time: '', venue: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    const endpoint = editingId ? `/meetings/${editingId}` : '/meetings';
    const method = editingId ? 'PUT' : 'POST';

    apiFetch(endpoint, {
      method,
      body: JSON.stringify(form)
    })
      .then(data => {
        if (data.success) {
          if (editingId) {
            setMeetings(prev => prev.map(m => m.id === data.meeting.id ? data.meeting : m));
            setMsg('Meeting updated successfully!');
          } else {
            setMeetings(prev => [data.meeting, ...prev]);
            setMsg('Meeting added successfully!');
          }
          resetForm();
        } else {
          setMsg(data.error || 'Imeshindwa');
        }
      })
      .catch(() => setMsg('Cannot connect to server'));
  };

  const handleEdit = (meeting) => {
    setEditingId(meeting.id);
    setForm({
      title: meeting.title || '',
      date: meeting.date || '',
      time: meeting.time || '',
      venue: meeting.venue || '',
    });
    setShowForm(true);
    setMsg('');
  };

  const handleDelete = (meetingId, title) => {
    if (!window.confirm(`Are you sure you want to delete this meeting? This action cannot be undone.\n\n"${title}"`)) return;

    apiFetch(`/meetings/${meetingId}`, { method: 'DELETE' })
      .then(data => {
        if (data.success) {
          setMeetings(prev => prev.filter(m => m.id !== meetingId));
          setMsg('Meeting deleted successfully!');
        } else {
          setMsg(data.error || 'Failed to delete meeting');
        }
      })
      .catch(() => setMsg('Cannot connect to server'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Meetings</h2>
        <button className="small" onClick={() => {
          if (showForm && editingId) resetForm();
          else setShowForm(!showForm);
        }}>
          {showForm ? 'Close' : '+ Add Meeting'}
        </button>
      </div>

      {msg && <p className="msg-success" style={{ marginBottom: '16px' }}>{msg}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleSave}>
            <label>{editingId ? 'Edit Meeting' : 'Meeting Title'}</label>
            <input value={form.title} onChange={set('title')} required />

            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} required />

            <label>Time</label>
            <input type="time" value={form.time} onChange={set('time')} required />

            <label>Venue</label>
            <input value={form.venue} onChange={set('venue')} placeholder="e.g. Church, Office..." />

            <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
              <button type="submit">{editingId ? 'Save Changes' : 'Save'}</button>
              {editingId && <button type="button" className="small" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {meetings.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', fontWeight: 300 }}>No meetings scheduled yet.</p>
      )}
      {meetings.map(m => (
        <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 12 }}>{m.title}</h3>
            <MeetingMeta date={m.date} time={m.time} venue={m.venue} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="small" onClick={() => handleEdit(m)}>Edit</button>
            <button type="button" className="small" onClick={() => handleDelete(m.id, m.title)} style={{ background: '#b00020', borderColor: '#b00020' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MeetingMeta({ date, time, venue }) {
  const d = date ? new Date(date + 'T00:00:00') : null;
  const dayName   = d ? d.toLocaleDateString('en-KE', { weekday: 'long' }) : '';
  const dateStr   = d ? d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : date;
  const timeStr   = time ? new Date('1970-01-01T' + time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={row}><span style={lbl}>Date</span><span style={val}>{dateStr}</span></div>
      <div style={row}><span style={lbl}>Day</span><span style={val}>{dayName}</span></div>
      <div style={row}><span style={lbl}>Time</span><span style={val}>{timeStr}</span></div>
      {venue && <div style={row}><span style={lbl}>Venue</span><span style={val}>{venue}</span></div>}
    </div>
  );
}

const row = { display: 'flex', gap: 8, alignItems: 'baseline' };
const lbl = { fontSize: 12, fontWeight: 600, color: '#0A2463', minWidth: 44, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' };
const val = { fontSize: 14, fontWeight: 400, color: '#0A2463' };

export default MeetingList;
