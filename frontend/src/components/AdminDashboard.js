import React, { useState, useEffect } from 'react';
import MembersList from './MembersList';
import RegisterMember from './EnhancedRegistrationPro';
import BulkMessaging from './BulkMessaging';
import MeetingList from './MeetingList';
import Donate from './Donate';
import PendingMembers from './PendingMembers';
import AdminManagement from './AdminManagement';
import API_BASE from '../utils/apiConfig';

function AdminDashboard({ adminName, onLogout }) {
  const [tab, setTab] = useState('members');
  const [stats, setStats] = useState({ total: 0, meetings: 0, pending: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const adminRole = localStorage.getItem('adminRole');
  const isSuperAdmin = adminRole === 'superadmin';

  useEffect(() => {
    fetch(`${API_BASE}/members`, { headers: { 'User-Role': 'admin' } })
      .then(r => r.json()).then(d => setStats(s => ({ ...s, total: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
    fetch(`${API_BASE}/meetings`)
      .then(r => r.json()).then(d => setStats(s => ({ ...s, meetings: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
    fetch(`${API_BASE}/admin/pending-members`, { headers: { 'User-Role': 'admin' } })
      .then(r => r.json()).then(d => setStats(s => ({ ...s, pending: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
  }, [tab]);

  const tabs = [
    { id: 'members',  label: '👥 Members' },
    { id: 'register', label: '➕ Register' },
    { id: 'pending',  label: '⏳ Pending' },
    { id: 'sms',      label: '📩 SMS' },
    { id: 'meetings', label: '📅 Meetings' },
    { id: 'donate',   label: '💳 Donate' },
    ...(isSuperAdmin ? [{ id: 'settings', label: '⚙️ Settings' }] : []),
  ];

  return (
    <div className="layout">

      {/* ── Navbar ── */}
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo">
          <img src="/mbogo-background.jpeg" alt="logo" style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid #fff', flexShrink: 0 }} />
          <div>
            <div className="logo-name">Mbogo Foundation</div>
            <div className="logo-tagline">Empowering Communities</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {tabs.map(t => (
            <button key={t.id} className={`nav-link ${tab === t.id ? 'nav-link-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Admin info + logout */}
        <div className="navbar-right">
          <div className="navbar-admin">
            <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{adminName}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {tabs.map(t => (
            <button key={t.id} className={`mobile-link ${tab === t.id ? 'mobile-link-active' : ''}`}
              onClick={() => { setTab(t.id); setMenuOpen(false); }}>
              {t.label}
            </button>
          ))}
          <button className="mobile-link" onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      {/* ── Stats Banner ── */}
      <div className="stats-banner">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Members</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.meetings}</span>
          <span className="stat-label">Meetings</span>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setTab('pending')}>
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="main-content">
        {tab === 'members'  && <MembersList />}
        {tab === 'register' && <RegisterMember onRegistrationSuccess={() => setTab('members')} />}
        {tab === 'pending'  && <PendingMembers />}
        {tab === 'sms'      && <BulkMessaging />}
        {tab === 'meetings' && <MeetingList />}
        {tab === 'donate'   && <Donate />}
        {tab === 'settings' && isSuperAdmin && <AdminManagement />}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/mbogo-background.jpeg" alt="logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <div>
                <div className="footer-name">Mbogo Welfare Empowerment Foundation</div>
                <div className="footer-tagline">Empowering Communities Through Unity</div>
              </div>
            </div>
            <div className="footer-links">
              <p className="footer-links-title">Quick Links</p>
              {tabs.map(t => (
                <button key={t.id} className="footer-link" onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
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

export default AdminDashboard;
