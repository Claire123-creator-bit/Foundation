import React, { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import MemberRegister from './components/MemberRegister';
import LandingPage from './components/LandingPage';
import AwaitingApproval from './components/AwaitingApproval';
import JoinChoice from './components/JoinChoice';
import { getToken, me, setToken, clearNonTokenAuthState } from './utils/auth';

function App() {
  const [role, setRole]       = useState(null);
  const [status, setStatus]   = useState(null);
  const [admin, setAdmin]     = useState(null);
  const [member, setMember]   = useState(null);
  const [page, setPage]       = useState('home');
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setRestoring(false); return; }

    (async () => {
      try {
        const data = await me();
        setRole(data.role || null);
        if (data.role === 'member') {
          setMember(data.member || null);
          setStatus(data.status || data.member?.status || null);
          setAdmin(null);
        } else {
          setAdmin(data.admin || null);
          setMember(null);
          setStatus(null);
        }
      } catch {
        setToken(null);
        clearNonTokenAuthState();
        setRole(null); setAdmin(null); setMember(null); setStatus(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const handleAdminLogin = (token) => {
    setToken(token); setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role); setAdmin(data.admin); setMember(null); setStatus(null);
      } catch { setToken(null); }
      finally { setRestoring(false); }
    })();
  };

  const handleMemberLogin = (token) => {
    setToken(token); setRestoring(true);
    (async () => {
      try {
        const data = await me();
        setRole(data.role);
        setMember(data.member);
        setStatus(data.status || data.member?.status || null);
        setAdmin(null);
      } catch { setToken(null); }
      finally { setRestoring(false); }
    })();
  };

  // Called after successful registration — store a pending token so the
  // awaiting screen persists across refreshes
  const handleMemberRegistered = (token, memberData) => {
    setToken(token);
    setRole('member');
    setStatus('pending');
    setMember(memberData);
    setAdmin(null);
  };

  const handleLogout = () => {
    setToken(null);
    clearNonTokenAuthState();
    setRole(null); setAdmin(null); setMember(null); setStatus(null);
    setPage('home');
  };

  if (restoring) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16 }}>
      Loading...
    </div>
  );

  // Admin dashboards
  if (role && role !== 'member' && admin)
    return <AdminDashboard adminName={admin.full_name || admin.username} adminRole={admin.role} onLogout={handleLogout} />;

  // Approved member
  if (role === 'member' && member && status === 'approved')
    return <MemberDashboard member={member} onLogout={handleLogout} />;

  // Pending member — show awaiting screen
  if (role === 'member' && member && status === 'pending')
    return <AwaitingApproval member={member} onLogout={handleLogout} />;

  // Unauthenticated pages
  if (page === 'admin-login')
    return <LoginPage onLogin={handleAdminLogin} onBack={() => setPage('home')} />;

  if (page === 'member-login')
    return <MemberLogin onLogin={handleMemberLogin} onBack={() => setPage('home')} onRegister={() => setPage('member-register')} />;

  if (page === 'member-register')
    return <MemberRegister onBack={() => setPage('home')} onLogin={() => setPage('member-login')} onRegistered={handleMemberRegistered} />;

  // Default: render landing page. When page === 'join-choice' show a dedicated JoinChoice page
  if (page === 'join-choice')
    return (
      <JoinChoice
        onBack={() => setPage('home')}
        onRegister={() => setPage('member-register')}
        onSignIn={() => setPage('member-login')}
        onAdminLogin={() => setPage('admin-login')}
      />
    );

  return <LandingPage onJoinUs={() => setPage('join-choice')} onAdminLogin={() => setPage('admin-login')} />;
}

export default App;
