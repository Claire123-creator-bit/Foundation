import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';

function App() {
  const [adminName, setAdminName] = useState(null);
  const [member, setMember] = useState(null);
  const [page, setPage] = useState('home');

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminName');
    const storedMember = localStorage.getItem('memberData');
    if (storedAdmin) setAdminName(storedAdmin);
    else if (storedMember) setMember(JSON.parse(storedMember));
    else setPage('home');
  }, []);

  const handleAdminLogin = (name, username, role) => {
    setAdminName(name);
    localStorage.setItem('adminName', name);
    localStorage.setItem('adminUsername', username);
    localStorage.setItem('adminRole', role);
  };

  const handleMemberLogin = (memberData) => {
    setMember(memberData);
    localStorage.setItem('memberData', JSON.stringify(memberData));
  };

  const handleLogout = () => {
    setAdminName(null);
    setMember(null);
    localStorage.clear();
    setPage('home');
  };

  if (adminName) return <AdminDashboard adminName={adminName} onLogout={handleLogout} />;
  if (member) return <MemberDashboard member={member} onLogout={handleLogout} />;

  if (page === 'admin-login') return <LoginPage onLogin={handleAdminLogin} onBack={() => setPage('home')} />;
  if (page === 'member-login') return <MemberLogin onLogin={handleMemberLogin} onBack={() => setPage('home')} />;
  if (page === 'member-register') return <MemberRegister onBack={() => setPage('home')} />;

  // Home — choose portal
  return (
    <div style={s.page}>
      <div style={s.overlay}>
        <div style={s.logo}>
          <img src="/mbogo-background.jpeg" alt="logo" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '4px solid #fff', marginBottom: 16 }} />
          <h1 style={s.title}>Mbogo Welfare Empowerment Foundation</h1>
          <p style={s.tagline}>Empowering Communities Through Unity</p>
        </div>

        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.cardIcon}></div>
            <h2 style={s.cardTitle}>Member Portal</h2>
            <p style={s.cardDesc}>View meetings, make payments and receive updates from the foundation.</p>
            <button style={s.btnWhite} onClick={() => setPage('member-login')}>Member Login</button>
            <button style={s.btnOutline} onClick={() => setPage('member-register')}>Register Now</button>
          </div>

          <div style={s.card}>
            <div style={s.cardIcon}></div>
            <h2 style={s.cardTitle}>Admin Portal</h2>
            <p style={s.cardDesc}>Manage members, send SMS, schedule meetings and process payments.</p>
            <button style={s.btnWhite} onClick={() => setPage('admin-login')}>Admin Login</button>
          </div>
        </div>

        <p style={s.copy}> {new Date().getFullYear()} Mbogo Welfare Empowerment Foundation</p>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' },
  overlay:   { minHeight: '100vh', background: 'rgba(10,36,99,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
  logo:      { textAlign: 'center', marginBottom: 48 },
  title:     { color: '#fff', fontSize: 26, fontWeight: 700, marginBottom: 8, maxWidth: 500 },
  tagline:   { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 300 },
  cards:     { display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 },
  card:      { background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)', padding: 32, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 },
  cardIcon:  { fontSize: 40, marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 },
  cardDesc:  { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 300, lineHeight: 1.6, margin: 0 },
  btnWhite:  { width: '100%', height: 44, background: '#fff', color: '#0A2463', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnOutline:{ width: '100%', height: 44, background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  copy:      { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 300 },
};

export default App;
