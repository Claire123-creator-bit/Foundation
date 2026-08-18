import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiClient';

function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchMembers = () => {
    apiFetch('/members')
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    apiFetch(`/admin/delete-member/${id}`, { method: 'DELETE' })
      .then(d => {
        setDeleting(null);
        if (d.success) setMembers(prev => prev.filter(m => m.id !== id));
      })
      .catch(() => setDeleting(null));
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center', fontWeight: 300 }}>Loading...</p>;

  return (
    <div>
      <h2>Members ({members.length})</h2>
      {members.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', fontWeight: 300 }}>No members registered yet.</p>
      )}
      {members.map(m => (
        <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>{m.full_names}</h3>
            <p style={{ margin: '2px 0' }}>{m.phone_number}</p>
            <p style={{ margin: '2px 0' }}>{m.ward}, {m.constituency}, {m.county}</p>
            <p style={{ margin: '2px 0' }}>{m.category}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: m.status === 'approved' ? '#059669' : '#b00020', fontWeight: 600, textTransform: 'uppercase' }}>{m.status}</p>
          </div>
          <button
            onClick={() => handleDelete(m.id, m.full_names)}
            disabled={deleting === m.id}
            style={{ height: 36, padding: '0 16px', background: '#b00020', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, opacity: deleting === m.id ? 0.6 : 1 }}
          >
            {deleting === m.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default MembersList;
