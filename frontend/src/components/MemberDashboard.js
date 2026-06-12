import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function MemberDashboard({ member, onLogout }) {
  const [tab, setTab] = useState('home');
  const [meetings, setMeetings] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/meetings`)
      .then(r => r.json())
      .then(d => setMeetings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'home',     label: 'Home' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'donate',   label: 'Pay' },
    { id: 'profile',  label: 'Profile' },
  ];

  return (
    <div className="layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/mbogo-background.jpeg" alt="logo" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', border: '2px solid #fff' }} />
          <div>
            <div className="logo-name">Mbogo Foundation</div>
            <div className="logo-tagline">Member Portal</div>
          </div>
        </div>
        <div className="navbar-links">
          {tabs.map(t => (
            <button key={t.id} className={`nav-link ${tab === t.id ? 'nav-link-active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="navbar-right">
          <div className="navbar-admin">
            <div className="admin-avatar">{member.full_names.charAt(0).toUpperCase()}</div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{member.full_names.split(' ')[0]}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {tabs.map(t => (
            <button key={t.id} className={`mobile-link ${tab === t.id ? 'mobile-link-active' : ''}`} onClick={() => { setTab(t.id); setMenuOpen(false); }}>{t.label}</button>
          ))}
          <button className="mobile-link" onClick={onLogout}>Logout</button>
        </div>
      )}

      <main className="main-content">
        {tab === 'home'     && <HomeTab member={member} meetings={meetings} setTab={setTab} />}
        {tab === 'meetings' && <MeetingsTab meetings={meetings} />}
        {tab === 'donate'   && <DonateTab member={member} />}
        {tab === 'profile'  && <ProfileTab member={member} />}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/mbogo-background.jpeg" alt="logo" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)' }} />
              <div>
                <div className="footer-name">Mbogo Welfare Empowerment Foundation</div>
                <div className="footer-tagline">Empowering Communities Through Unity</div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} Mbogo Welfare Empowerment Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeTab({ member, meetings, setTab }) {
  const upcoming = meetings.filter(m => new Date(m.date) >= new Date()).slice(0, 2);
  return (
    <div>
      <div style={{ background: '#0A2463', padding: 24, marginBottom: 24, color: '#fff' }}>
        <h2 style={{ color: '#fff', marginBottom: 4 }}>Welcome, {member.full_names.split(' ')[0]}!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{member.category}{member.county ? ` — ${member.county}` : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ background: '#0A2463', color: '#fff' }}>
          <span className="stat-number" style={{ color: '#fff' }}>{meetings.length}</span>
          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Meetings</span>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '2px solid #0A2463' }}>
          <span className="stat-number"></span>
          <span className="stat-label">Approved</span>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Upcoming Meetings</h3>
      {upcoming.length === 0 && <p style={{ fontWeight: 300, color: '#666' }}>No upcoming meetings.</p>}
      {upcoming.map(m => (
        <div key={m.id} className="card">
          <h3 style={{ marginBottom: 12 }}>{m.title}</h3>
          <MeetingMeta date={m.date} time={m.time} venue={m.venue} />
        </div>
      ))}
      {meetings.length > 2 && (
        <button onClick={() => setTab('meetings')} style={{ marginTop: 8 }}>View All Meetings</button>
      )}
    </div>
  );
}

function MeetingsTab({ meetings }) {
  return (
    <div>
      <h2>Meetings</h2>
      {meetings.length === 0 && <p style={{ fontWeight: 300, color: '#666', textAlign: 'center', padding: 40 }}>No meetings scheduled yet.</p>}
      {meetings.map(m => (
        <div key={m.id} className="card">
          <h3 style={{ marginBottom: 12 }}>{m.title}</h3>
          <MeetingMeta date={m.date} time={m.time} venue={m.venue} />
          {m.agenda && <p style={{ marginTop: 10, fontWeight: 300, color: '#444' }}>{m.agenda}</p>}
        </div>
      ))}
    </div>
  );
}

function DonateTab({ member }) {
  const [form, setForm] = useState({ phone: member.phone_number || '', amount: '', name: member.full_names || '', type: 'Donation' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const types = ['Donation', 'Contribution', 'Welfare Fund'];
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    fetch(`${API_BASE}/mpesa-stk-push`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(d => { setLoading(false); if (d.success) setStatus('success'); else setStatus(d.error || 'Failed'); })
      .catch(() => { setLoading(false); setStatus('error'); });
  };

  if (status === 'success') return (
    <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', border: '2px solid #0A2463' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}></div>
      <h2 style={{ color: '#0A2463', marginBottom: 8 }}>Request Sent!</h2>
      <p style={{ color: '#444', marginBottom: 24 }}>Check your phone <strong>{form.phone}</strong> for an M-Pesa prompt.<br />Enter your PIN to complete KES {form.amount}.</p>
      <button onClick={() => setStatus('')}>Make Another Payment</button>
    </div>
  );

  return (
    <div>
      <h2>Make a Payment</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '2px solid #0A2463', padding: 16, marginBottom: 24 }}>
        <div style={{ background: '#4CAF50', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 12px' }}>M-PESA</div>
        <div>
          <p style={{ fontWeight: 600, color: '#0A2463', fontSize: 14 }}>Lipa Na M-Pesa</p>
          <p style={{ fontWeight: 300, color: '#666', fontSize: 13 }}>Send money to: <strong style={{ color: '#0A2463', fontSize: 16 }}>0720732464 (Peter Mbogo)</strong></p>
          <p style={{ fontWeight: 300, color: '#666', fontSize: 12 }}>Use your name as the account reference</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label style={ls.label}>Full Name</label>
        <input style={ls.input} value={form.name} onChange={set('name')} required />
        <label style={ls.label}>M-Pesa Phone</label>
        <input style={ls.input} value={form.phone} onChange={set('phone')} placeholder="07XXXXXXXX" required />
        <label style={ls.label}>Payment Type</label>
        <select style={ls.input} value={form.type} onChange={set('type')}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <label style={ls.label}>Amount (KES)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {quickAmounts.map(a => (
            <button key={a} type="button" onClick={() => setForm({ ...form, amount: String(a) })}
              style={{ width: 'auto', height: 36, padding: '0 16px', background: form.amount === String(a) ? '#0A2463' : '#fff', color: form.amount === String(a) ? '#fff' : '#0A2463', border: '2px solid #0A2463', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {a.toLocaleString()}
            </button>
          ))}
        </div>
        <input style={ls.input} value={form.amount} onChange={set('amount')} placeholder="Or enter custom amount" type="number" min="1" required />
        {status === 'error' && <p className="msg-error">Cannot connect to server</p>}
        {status && status !== 'error' && status !== 'success' && <p className="msg-error">{status}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Pay with M-Pesa'}</button>
      </form>
    </div>
  );
}

function ProfileTab({ member }) {
  return (
    <div>
      <h2>My Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, background: '#0A2463', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>
            {member.full_names.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{member.full_names}</h3>
            <p style={{ margin: 0 }}>{member.category}</p>
          </div>
        </div>
        {[
          ['Phone', member.phone_number],
          ['National ID', member.national_id],
          ['County', member.county || '—'],
          ['Constituency', member.constituency || '—'],
          ['Ward', member.ward || '—'],
          ['Physical Location', member.physical_location || '—'],
          ['Gender', member.gender || '—'],
          ['Category', member.category],
          ['Registered', new Date(member.registration_date).toLocaleDateString('en-KE')],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600, color: '#0A2463', fontSize: 14 }}>{label}</span>
            <span style={{ color: value === '—' ? '#bbb' : '#444', fontSize: 14, fontWeight: 300, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingMeta({ date, time, venue }) {
  const d = date ? new Date(date + 'T00:00:00') : null;
  const dayName = d ? d.toLocaleDateString('en-KE', { weekday: 'long' }) : '';
  const dateStr = d ? d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : date;
  const timeStr = time ? new Date('1970-01-01T' + time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={mr}><span style={ml}>Date</span><span style={mv}>{dateStr}</span></div>
      <div style={mr}><span style={ml}>Day</span><span style={mv}>{dayName}</span></div>
      <div style={mr}><span style={ml}>Time</span><span style={mv}>{timeStr}</span></div>
      {venue && <div style={mr}><span style={ml}>Venue</span><span style={mv}>{venue}</span></div>}
    </div>
  );
}

const mr = { display: 'flex', gap: 8, alignItems: 'baseline' };
const ml = { fontSize: 12, fontWeight: 600, color: '#0A2463', minWidth: 44, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' };
const mv = { fontSize: 14, fontWeight: 400, color: '#0A2463' };

const ls = {
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2463', marginBottom: 6 },
  input: { width: '100%', padding: '12px 14px', fontSize: 14, border: '2px solid #0A2463', background: '#fff', color: '#0A2463', outline: 'none', marginBottom: 16, boxSizing: 'border-box' },
};

export default MemberDashboard;
