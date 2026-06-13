import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import CompleteGoogleProfile from './components/CompleteGoogleProfile';
import { getToken, me, setToken, clearNonTokenAuthState } from './utils/auth';



function App() {
  const [role, setRole] = useState(null); // 'admin' | 'member' | 'superadmin'
  const [admin, setAdmin] = useState(null);
  const [member, setMember] = useState(null);
  const [page, setPage] = useState('home');
  const [restoring, setRestoring] = useState(true);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    const googlePendingProfile = params.get('google_pending_profile') === '1';
    const pendingToken = params.get('token');

    if (googleToken) {
      setToken(googleToken);
      params.delete('google_token');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, document.title, newUrl);
    }

    if (googlePendingProfile && pendingToken) {
      localStorage.setItem('pending_token', pendingToken);
      params.delete('token');
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
        setRole(data.role || null);
        if (data.role === 'member') {
          setMember(data.member || null);
          setAdmin(null);
        } else {
          setAdmin(data.admin || null);
          setMember(null);
        }
      } catch (e) {
        setToken(null);
        clearNonTokenAuthState();
        setRole(null);
        setAdmin(null);
        setMember(null);
      } finally {
        setRestoring(false);
      }

    })();
  }, []);

  const handleAdminLogin = (_name, _username, _role, token) => {
    setToken(token);
    // force /me to become source of truth via next render
    setRole(null);
    setAdmin(null);
    setMember(null);
    setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role || null);
        setAdmin(data.admin || null);
        setMember(null);
      } catch {
        setToken(null);
        setRole(null);
        setAdmin(null);
        setMember(null);
      } finally {
        setRestoring(false);
      }
    })();
  };

  const handleMemberLogin = (_memberData, token) => {
    setToken(token);
    setRole(null);
    setAdmin(null);
    setMember(null);
    setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role || null);
        setMember(data.member || null);
        setAdmin(null);
      } catch {
        setToken(null);
        setRole(null);
        setAdmin(null);
        setMember(null);
      } finally {
        setRestoring(false);
      }
    })();
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setAdmin(null);
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

  if (role && role !== 'member' && admin) return <AdminDashboard adminName={admin.full_name || admin.username || 'Admin'} onLogout={handleLogout} />;
  if (role === 'member' && member) return <MemberDashboard member={member} onLogout={handleLogout} />;


  const params = new URLSearchParams(window.location.search);
  const googlePendingProfile = params.get('google_pending_profile') === '1';

  if (googlePendingProfile) {
    return (
      <CompleteGoogleProfile
        onBack={() => setPage('home')}
        onComplete={(jwtToken) => {
          setToken(jwtToken);
          // No member state set here; the existing /me restore will run.
        }}
      />
    );
  }

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

