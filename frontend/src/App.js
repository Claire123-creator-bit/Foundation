import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import CompleteGoogleProfile from './components/CompleteGoogleProfile';
import LandingPage from './components/LandingPage';
import { getToken, me, setToken, clearNonTokenAuthState } from './utils/auth';

const s = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }
};

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
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, document.title, newUrl);
    }

    if (googlePendingProfile && pendingToken) {
      localStorage.setItem('pending_token', pendingToken);
      params.delete('token');
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
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
        <div style={{ textAlign: 'center', padding: 40, fontWeight: 300 }}>
          Loading session...
        </div>
      </div>
    );
  }

  if (role && role !== 'member' && admin)
    return (
      <AdminDashboard
        adminName={admin.full_name || admin.username || 'Admin'}
        onLogout={handleLogout}
      />
    );

  if (role === 'member' && member)
    return <MemberDashboard member={member} onLogout={handleLogout} />;

  const params = new URLSearchParams(window.location.search);
  const googlePendingProfile =
    params.get('google_pending_profile') === '1';

  if (googlePendingProfile) {
    return (
      <CompleteGoogleProfile
        onBack={() => setPage('home')}
        onComplete={(jwtToken) => {
          setToken(jwtToken);
        }}
      />
    );
  }

  if (page === 'admin-login')
    return (
      <LoginPage
        onLogin={handleAdminLogin}
        onBack={() => setPage('home')}
      />
    );

  if (page === 'member-login')
    return (
      <MemberLogin
        onLogin={handleMemberLogin}
        onBack={() => setPage('home')}
      />
    );

  if (page === 'member-register')
    return <MemberRegister onBack={() => setPage('home')} />;

  return (
    <LandingPage
      onJoinUs={() => setPage('member-register')}
      onAdminLogin={() => setPage('admin-login')}
    />
  );
}

export default App;