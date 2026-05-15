import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function AdminManagement() {
  const username = localStorage.getItem('adminUsername');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '', role: 'admin' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const headers = { 'Content-Type': 'application/json', 'Admin-Username': username };

  const fetchAdmins = () => {
    fetch(`${API_BASE}/admin/list-admins`, { headers })
      .then(r => r.json())
      .then(d => { setAdmins(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    fetch(`${API_BASE}/admin-register`, {
      method: 'POST', headers,
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setMsg('Admin created successfully'); setShowForm(false); setForm({ full_name: '', username: '', email: '', phone: '', password: '', role: 'admin' }); fetchAdmins(); }
        else setError(d.message);
      })
      .catch(() => setError('Cannot connect to server'));
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remove admin "${name}"?`)) return;
    fetch(`${API_BASE}/admin/delete-admin/${id}`, { method: 'DELETE', headers })
      .then(r => r.json())
      .then(d => { if (d.success) { setMsg('Admin removed'); fetchAdmins(); } else setError(d.error); })
      .catch(() => setError('Cannot connect to server'));
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  if (loading) return <p style={{ padding: 40, textAlign: 'center', fontWeight: 300 }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Admin Management</h2>
        <button className="small" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ Add Admin'}</button>
      </div>

      {msg   && <p className="msg-success" style={{ marginBottom: 12 }}>✅ {msg}</p>}
      {error && <p className="msg-error"   style={{ marginBottom: 12 }}>❌ {error}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Create New Admin</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Full Name</label>
                <input value={form.full_name} onChange={set('full_name')} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Username</label>
                <input value={form.username} onChange={set('username')} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone</label>
                <input value={form.phone} onChange={set('phone')} placeholder="07XXXXXXXX" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Password</label>
                <input type="password" value={form.password} onChange={set('password')} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Role</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="finance">Finance</option>
                  <option value="communication">Communication</option>
                </select>
              </div>
            </div>
            <button type="submit">Create Admin</button>
          </form>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>All Admins ({admins.length})</h3>
      {admins.map(a => (
        <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>{a.full_name}</h3>
            <p>👤 @{a.username}</p>
            <p>📧 {a.email}</p>
            {a.phone && <p>📞 {a.phone}</p>}
            <p>🏷️ <span style={{ background: a.role === 'superadmin' ? '#0A2463' : '#eef1fa', color: a.role === 'superadmin' ? '#fff' : '#0A2463', padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{a.role}</span></p>
            <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Last login: {a.last_login ? new Date(a.last_login).toLocaleString() : 'Never'}</p>
          </div>
          {a.role !== 'superadmin' && (
            <button onClick={() => handleDelete(a.id, a.full_name)}
              style={{ width: 'auto', height: 36, padding: '0 16px', background: '#b00020', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminManagement;
