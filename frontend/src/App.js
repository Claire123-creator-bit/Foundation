import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [adminName, setAdminName] = useState(null);
  const [page, setPage] = useState('login');

  useEffect(() => {
    const stored = localStorage.getItem('adminName');
    if (stored) setAdminName(stored);
  }, []);

  const handleLogin = (name) => {
    setAdminName(name);
    localStorage.setItem('adminName', name);
  };

  const handleLogout = () => {
    setAdminName(null);
    localStorage.clear();
    setPage('login');
  };

  if (adminName) return <AdminDashboard adminName={adminName} onLogout={handleLogout} />;
  if (page === 'signup') return <SignupPage onLogin={handleLogin} onSwitch={() => setPage('login')} />;
  return <LoginPage onLogin={handleLogin} onSwitch={() => setPage('signup')} />;
}

export default App;
