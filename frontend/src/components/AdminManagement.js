import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/apiClient';
import { displayLocalNumber } from '../utils/phone';

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '', role: 'admin', is_active: true });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchAdmins = useCallback(() => {
    apiFetch('/admin/list-admins')
      .then(d => { setAdmins(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const resetForm = () => {
    setForm({ full_name: '', username: '', email: '', phone: '', password: '', role: 'admin', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setMsg(''); setError('');

    const payload = { ...form };
    const endpoint = editingId ? `/admin/update-admin/${editingId}` : '/admin-register';
    const method = editingId ? 'PUT' : 'POST';

    apiFetch(endpoint, {
      method,
      body: JSON.stringify(payload),
    })
      .then(d => {
        if (d.success) {
          setMsg(editingId ? 'Admin updated successfully' : 'Admin created successfully');
          resetForm();
          fetchAdmins();
        } else {
          setError(d.message || d.error || 'Failed');
        }
      })
      .catch(() => setError('Cannot connect to server'));
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setForm({
      full_name: admin.full_name || '',
      username: admin.username || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '',
      role: admin.role || 'admin',
      is_active: admin.is_active !== false,
    });
    setShowForm(true);
    setMsg(''); setError('');
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remove admin "${name}"?`)) return;
    apiFetch(`/admin/delete-admin/${id}`, { method: 'DELETE' })
      .then(d => { if (d.success) { setMsg('Admin removed'); fetchAdmins(); } else setError(d.error || 'Failed'); })
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

      {msg   && <p className="msg-success" style={{ marginBottom: 12 }}> {msg}</p>}
      {error && <p className="msg-error"   style={{ marginBottom: 12 }}> {error}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Admin' : 'Create New Admin'}</h3>
          <form onSubmit={handleCreate}>
            <div className="admin-form-row" style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Full Name</label>
                <input value={form.full_name} onChange={set('full_name')} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Username</label>
                <input value={form.username} onChange={set('username')} required />
              </div>
            </div>
            <div className="admin-form-row" style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone</label>
                <input value={form.phone} onChange={set('phone')} placeholder="07XXXXXXXX" />
              </div>
            </div>
            <div className="admin-form-row" style={{ display: 'flex', gap: 16 }}>
              {!editingId && (
                <div style={{ flex: 1 }}>
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={set('password')} required={!editingId} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <label>Role</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="finance">Finance</option>
                  <option value="communication">Communication</option>
                </select>
              </div>
              {editingId && (
                <div style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={String(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit">{editingId ? 'Save Changes' : 'Create Admin'}</button>
              {editingId && <button type="button" className="small" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>All Admins ({admins.length})</h3>
      {admins.map(a => (
        <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>{a.full_name}</h3>
            <p> @{a.username}</p>
            <p> {a.email}</p>
            {a.phone && <p>{displayLocalNumber(a.phone)}</p>}
            <p> <span style={{ background: a.role === 'superadmin' ? '#0A2463' : '#eef1fa', color: a.role === 'superadmin' ? '#fff' : '#0A2463', padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{a.role}</span></p>
            <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Last login: {a.last_login ? new Date(a.last_login).toLocaleString() : 'Never'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {a.role !== 'superadmin' && (
              <>
                <button
                  onClick={() => handleEdit(a)}
                  style={{ width: 'auto', height: 36, padding: '0 16px', background: '#0A2463', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id, a.full_name)}
                  style={{ width: 'auto', height: 36, padding: '0 16px', background: '#b00020', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminManagement;
