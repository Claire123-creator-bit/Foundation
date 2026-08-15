import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import LandingPage from './components/LandingPage';
import { getToken, me, setToken, clearNonTokenAuthState } from './utils/auth';

function App() {
  const [role, setRole] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [member, setMember] = useState(null);
  const [page, setPage] = useState('home');
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setRestoring(false); return; }

    (async () => {
      try {
        const data = await me();
        setRole(data.role || null);
        if (data.role === 'member') { setMember(data.member || null); setAdmin(null); }
        else { setAdmin(data.admin || null); setMember(null); }
      } catch {
        setToken(null); clearNonTokenAuthState();
        setRole(null); setAdmin(null); setMember(null);
      } finally { setRestoring(false); }
    })();
  }, []);

  const handleAdminLogin = (token) => {
    setToken(token); setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role); setAdmin(data.admin); setMember(null);
      } catch { setToken(null); }
      finally { setRestoring(false); }
    })();
  };

  const handleMemberLogin = (token) => {
    setToken(token); setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role); setMember(data.member); setAdmin(null);
      } catch { setToken(null); }
      finally { setRestoring(false); }
    })();
  };

  const handleLogout = () => {
    setToken(null); setRole(null); setAdmin(null); setMember(null); setPage('home');
  };

  if (restoring) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16 }}>
      Loading...
    </div>
  );

  if (role && role !== 'member' && admin)
    return <AdminDashboard adminName={admin.full_name || admin.username} onLogout={handleLogout} />;

  if (role === 'member' && member)
    return <MemberDashboard member={member} onLogout={handleLogout} />;

  if (page === 'admin-login') return <LoginPage onLogin={handleAdminLogin} onBack={() => setPage('home')} />;
  if (page === 'member-login') return <MemberLogin onLogin={handleMemberLogin} onBack={() => setPage('home')} onRegister={() => setPage('member-register')} />;
  if (page === 'member-register') return <MemberRegister onBack={() => setPage('home')} onLogin={() => setPage('member-login')} />;

  return <LandingPage onJoinUs={() => setPage('member-register')} onAdminLogin={() => setPage('admin-login')} />;
}

export default App;
