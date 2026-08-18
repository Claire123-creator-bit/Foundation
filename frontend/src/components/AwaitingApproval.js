import React from 'react';

function AwaitingApproval({ member, onLogout }) {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>⏳</div>
        <h2 style={s.title}>Application Under Review</h2>
        <p style={s.text}>
          Hi <strong>{member?.full_names?.split(' ')[0] || 'there'}</strong>, your registration
          has been received. An administrator will review and approve your account shortly.
        </p>
        <p style={s.text}>
          You will receive an SMS on <strong>{member?.phone_number}</strong> once your
          account is approved.
        </p>
        <button style={s.btn} onClick={onLogout}>Back to Home</button>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' },
  card:  { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '48px 36px', maxWidth: 440, width: '100%', textAlign: 'center' },
  icon:  { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#0A2463', margin: '0 0 16px' },
  text:  { fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: '0 0 12px' },
  btn:   { marginTop: 24, width: '100%', height: 48, background: '#0A2463', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};

export default AwaitingApproval;
