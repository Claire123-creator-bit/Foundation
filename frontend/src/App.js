import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import { getToken, me, setToken } from './utils/auth';

function App() {
  const [adminName, setAdminName] = useState(null);
  const [adminUsername, setAdminUsername] = useState(null);
  const [adminRole, setAdminRole] = useState(null);

  const [member, setMember] = useState(null);
  const [page, setPage] = useState('home');
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    if (googleToken) {
      setToken(googleToken);
      params.delete('google_token');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, document.title, newUrl);
    }

    const token = getToken();
    if (!token) {
      setRestoring(false);
      return;
    }


    (async () => {
      try {
        const data = await me();

        if (data.role === 'admin' && data.admin) {
          setAdminName(data.admin.full_name);
          setAdminUsername(data.admin.username);
          setAdminRole(data.admin.role || 'admin');
          setMember(null);
        } else if (data.role === 'member' && data.member) {
          setMember(data.member);
          setAdminName(null);
          setAdminUsername(null);
          setAdminRole(null);
        } else {
          setAdminName(null);
          setAdminUsername(null);
          setAdminRole(null);
          setMember(null);
        }
      } catch (e) {
        setToken(null);
        setAdminName(null);
        setAdminUsername(null);
        setMember(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const handleAdminLogin = (name, username, role, token) => {
    setToken(token);
    setAdminName(name);
    setAdminUsername(username);
    setAdminRole(role);
    setMember(null);
  };


  const handleMemberLogin = (memberData, token) => {
    setToken(token);
    setMember(memberData);
    setAdminName(null);
    setAdminUsername(null);
    setAdminRole(null);
  };

  const handleLogout = () => {
    setToken(null);
    setAdminName(null);
    setAdminUsername(null);
    setAdminRole(null);
    setMember(null);
    setPage('home');
  };


  if (restoring) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 40, fontWeight: 300 }}>Loading session...</div>
      </div>
    );
  }

  if (adminName && adminUsername) return <AdminDashboard adminName={adminName} onLogout={handleLogout} />;
  if (member) return <MemberDashboard member={member} onLogout={handleLogout} />;

  if (page === 'admin-login') return <LoginPage onLogin={handleAdminLogin} onBack={() => setPage('home')} />;
  if (page === 'member-login') return <MemberLogin onLogin={handleMemberLogin} onBack={() => setPage('home')} />;
  if (page === 'member-register') return <MemberRegister onBack={() => setPage('home')} />;

  return (
    <div style={s.page}>
      <div style={s.overlay}>
        <div style={s.logo}>
          <img
            src="/mbogo-background.jpeg"
            alt="Mbogo Foundation logo"
            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '4px solid #fff', marginBottom: 16 }}
          />
          <h1 style={s.title}>Mbogo Welfare Empowerment Foundation</h1>
          <p style={s.tagline}>Empowering Communities Through Unity</p>
        </div>

        <div style={s.cards}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Member Portal</h2>
            <p style={s.cardDesc}>View meetings, make payments and receive updates from the foundation.</p>
            <button style={s.btnWhite} onClick={() => setPage('member-login')}>Member Login</button>
            <button style={s.btnOutline} onClick={() => setPage('member-register')}>Register Now</button>
          </div>


        </div>

        <div style={s.footerRow}>
          <p style={s.copy}>© {new Date().getFullYear()} Mbogo Welfare Empowerment Foundation</p>
          <button
            type="button"
            onClick={() => setPage('admin-login')}
            style={s.staffLink}
          >
            Staff Access
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', backgroundImage: 'url(/mbogo-background.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' },
  overlay:   { minHeight: '100vh', background: 'rgba(10,36,99,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' },
  logo:      { textAlign: 'center', marginBottom: 40 },
  title:     { color: '#fff', fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 700, marginBottom: 8, maxWidth: 340 },
  tagline:   { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 300 },
  cards:     { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32, width: '100%', maxWidth: 600 },
  card:      { background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)', padding: 24, flex: '1 1 240px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 },
  cardDesc:  { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 300, lineHeight: 1.6, margin: 0 },
  btnWhite:  { width: '100%', height: 48, background: '#fff', color: '#0A2463', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  btnOutline:{ width: '100%', height: 48, background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  copy:      { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 300 },
  footerRow: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 12 },
  staffLink: { width: 'auto', height: 34, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 20, padding: '0 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};


export default App;

