import React, { useEffect, useState } from 'react';
import API_BASE from '../utils/apiConfig';

function PendingMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchPending = () => {
    fetch(`${API_BASE}/admin/pending-members`, { headers: { 'User-Role': 'admin' } })
      .then(r => r.json())
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = (id, action) => {
    setProcessing(id);
    fetch(`${API_BASE}/admin/approve-member/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Role': 'admin' },
      body: JSON.stringify({ action })
    })
      .then(r => r.json())
      .then(d => { setProcessing(null); if (d.success) fetchPending(); })
      .catch(() => setProcessing(null));
  };

  if (loading) return <p style={{ padding: 40, textAlign: 'center', fontWeight: 300 }}>Loading...</p>;

  return (
    <div>
      <h2>Pending Approvals ({members.length})</h2>
      {members.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', border: '2px solid #0A2463' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 300, color: '#666' }}>No pending registrations.</p>
        </div>
      )}
      {members.map(m => (
        <div key={m.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ marginBottom: 6 }}>{m.full_names}</h3>
              <p>📞 {m.phone_number}</p>
              <p>🪪 ID: {m.national_id}</p>
              <p>📍 {m.ward}, {m.constituency}, {m.county}</p>
              <p>🏷️ {m.category}</p>
              {m.gender && <p>⚧ {m.gender}</p>}
              <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                Registered: {new Date(m.registration_date).toLocaleString()}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
              <button
                disabled={processing === m.id}
                onClick={() => handleAction(m.id, 'approve')}
                style={{ width: '100%', height: 40, background: '#1a7a1a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ✅ Approve
              </button>
              <button
                disabled={processing === m.id}
                onClick={() => handleAction(m.id, 'reject')}
                style={{ width: '100%', height: 40, background: '#b00020', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PendingMembers;
