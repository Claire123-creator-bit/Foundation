import React, { useEffect, useState } from 'react';
import API_BASE from '../utils/apiConfig';

function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/members`, { headers: { 'User-Role': 'admin' } })
      .then(res => res.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '40px', textAlign: 'center', fontWeight: 300 }}>Loading...</p>;

  return (
    <div>
      <h2>Members ({members.length})</h2>
      {members.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', fontWeight: 300 }}>No members registered yet.</p>
      )}
      {members.map(m => (
        <div key={m.id} className="card">
          <h3>{m.full_names}</h3>
          <p>📞 {m.phone_number}</p>
          <p>📍 {m.ward}, {m.constituency}, {m.county}</p>
          <p>🏷️ {m.category}</p>
        </div>
      ))}
    </div>
  );
}

export default MembersList;
