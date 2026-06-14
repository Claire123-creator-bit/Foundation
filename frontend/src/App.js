import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import CompleteGoogleProfile from './components/CompleteGoogleProfile';
import LandingPage from './components/LandingPage';
import { getToken, me, setToken, clearNonTokenAuthState } from './utils/auth';

function App() {
  const [role, setRole] = useState(null);
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
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (googlePendingProfile && pendingToken) {
      localStorage.setItem('pending_token', pendingToken);
      params.delete('token');
      window.history.replaceState({}, document.title, window.location.pathname);
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

  const handleAdminLogin = (token) => {
    setToken(token);
    setRestoring(true);

    (async () => {
      try {
        const data = await me();
        setRole(data.role);
        setAdmin(data.admin);
        setMember(null);
      } catch {
        setToken(null);
      } finally {
        setRestoring(false);
      }
    })();
  };

  const handleMemberLogin = (token) => {
    setToken(token);
    setRestoring(true);

    (async () => {
      try {
        const data = await me();
        setRole(data.role);
        setMember(data.member);
        setAdmin(null);
      } catch {
        setToken(null);
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: 16
      }}>
        Loading session...
      </div>
    );
  }

  if (role && role !== 'member' && admin) {
    return <AdminDashboard adminName={admin.full_name || admin.username} onLogout={handleLogout} />;
  }

  if (role === 'member' && member) {
    return <MemberDashboard member={member} onLogout={handleLogout} />;
  }

  const params = new URLSearchParams(window.location.search);
  const googlePendingProfile = params.get('google_pending_profile') === '1';

  if (googlePendingProfile) {
    return (
      <CompleteGoogleProfile
        onBack={() => setPage('home')}
        onComplete={(token) => setToken(token)}
      />
    );
  }

  if (page === 'admin-login') return <LoginPage onLogin={handleAdminLogin} onBack={() => setPage('home')} />;
  if (page === 'member-login') return <MemberLogin onLogin={handleMemberLogin} onBack={() => setPage('home')} />;
  if (page === 'member-register') return <MemberRegister onBack={() => setPage('home')} />;

  return (
    <LandingPage
      onJoinUs={() => setPage('member-register')}
      onAdminLogin={() => setPage('admin-login')}
    />
  );
}

export default App;