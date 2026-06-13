import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';

function MemberDashboard({ member, onLogout }) {
  const [tab, setTab] = useState('home');
  const [meetings, setMeetings] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiFetch('/meetings')
      .then(d => setMeetings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-logo">
          <img
            src="/mbogo-background.jpeg"
            alt="logo"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', border: '2px solid #fff' }}
          />
          <div>
            <div className="logo-name">Mbogo Foundation</div>
            <div className="logo-tagline">Member Portal</div>
          </div>
        </div>

        <div className="navbar-links">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-link ${tab === t.id ? 'nav-link-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="navbar-right">
          <div className="navbar-admin">
            <div className="admin-avatar">{member.full_names.charAt(0).toUpperCase()}</div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{member.full_names.split(' ')[0]}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`mobile-link ${tab === t.id ? 'mobile-link-active' : ''}`}
              onClick={() => {
                setTab(t.id);
                setMenuOpen(false);
              }}
            >
              {t.label}
            </button>
          ))}
          <button className="mobile-link" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}

      <main className="main-content">
        {tab === 'home' && <HomeTab member={member} meetings={meetings} setTab={setTab} />}
        {tab === 'meetings' && <MeetingsTab meetings={meetings} />}
        {tab === 'profile' && <ProfileTab member={member} />}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img
                src="/mbogo-background.jpeg"
                alt="logo"
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)' }}
              />
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
        <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
          {member.category}
          {member.county ? ` — ${member.county}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ background: '#0A2463', color: '#fff' }}>
          <span className="stat-number" style={{ color: '#fff' }}>
            {meetings.length}
          </span>
          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Meetings
          </span>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '2px solid #0A2463' }}>
          <span className="stat-number" />
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
        <button onClick={() => setTab('meetings')} style={{ marginTop: 8 }}>
          View All Meetings
        </button>
      )}
    </div>
  );
}

function MeetingsTab({ meetings }) {
  return (
    <div>
      <h2>Meetings</h2>
      {meetings.length === 0 && (
        <p style={{ fontWeight: 300, color: '#666', textAlign: 'center', padding: 40 }}>No meetings scheduled yet.</p>
      )}
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

function ProfileTab({ member }) {
  return (
    <div>
      <h2>My Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: '#0A2463',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
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
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <span style={{ fontWeight: 600, color: '#0A2463', fontSize: 14 }}>{label}</span>
            <span
              style={{
                color: value === '—' ? '#bbb' : '#444',
                fontSize: 14,
                fontWeight: 300,
                textAlign: 'right',
                maxWidth: '60%',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingMeta({ date, time, venue }) {
  const d = date ? new Date(date + 'T00:00:00') : null;
  const dayName = d ? d.toLocaleDateString('en-KE', { weekday: 'long' }) : '';
  const dateStr = d
    ? d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    : date;
  const timeStr = time ? new Date('1970-01-01T' + time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={mr}>
        <span style={ml}>Date</span>
        <span style={mv}>{dateStr}</span>
      </div>
      <div style={mr}>
        <span style={ml}>Day</span>
        <span style={mv}>{dayName}</span>
      </div>
      <div style={mr}>
        <span style={ml}>Time</span>
        <span style={mv}>{timeStr}</span>
      </div>
      {venue && (
        <div style={mr}>
          <span style={ml}>Venue</span>
          <span style={mv}>{venue}</span>
        </div>
      )}
    </div>
  );
}

const mr = { display: 'flex', gap: 8, alignItems: 'baseline' };
const ml = {
  fontSize: 12,
  fontWeight: 600,
  color: '#0A2463',
  minWidth: 44,
  opacity: 0.6,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};
const mv = { fontSize: 14, fontWeight: 400, color: '#0A2463' };

export default MemberDashboard;

