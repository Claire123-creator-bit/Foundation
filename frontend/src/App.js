import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import FAQ from './components/FAQ';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import UserDashboard from './components/UserDashboard';
import EnhancedRegistrationPro from './components/EnhancedRegistrationPro';
import MembersList from './components/MembersList';
import BulkMessaging from './components/BulkMessaging';
import DataCapture from './components/DataCapture';
import DatabaseViewer from './components/DatabaseViewer';
import MeetingMinutes from './components/MeetingMinutes';
import MeetingList from './components/MeetingList';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import MembershipConfirmation from './components/MembershipConfirmation';
import Donate from './components/Donate';
import ProfilePage from './components/ProfilePage';
import Watermark from './components/Watermark';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [memberData, setMemberData] = useState(null);
  
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    if (storedRole) {
      setUserRole(storedRole);
      setUserId(storedUserId);
      setUserName(storedUserName || '');
      setActiveTab('dashboard');
    } else {
      setActiveTab('landing');
    }
  }, []);

  const handleSignUpSuccess = (fullName, nationalId) => {
    // Store the signup data in localStorage for the registration form
    localStorage.setItem('signupName', fullName);
    localStorage.setItem('signupId', nationalId);
    // Don't set signupPhone with fullName - it should be empty for phone
    setSignupPhone(''); 
    setActiveTab('registration');
  };

  const handleRegistrationSuccess = (data) => {
    setMemberData(data.member_data);
    setActiveTab('confirmation');
    
    fetch('https://foundation-0x4i.onrender.com/send-welcome-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: data.member_data.phone_number,
        member_name: data.member_data.full_names
      })
    }).catch(() => {});
  };

  const handleConfirmationContinue = () => {
    if (memberData) {
      const userId = memberData.id || memberData.user_id;
      const userName = memberData.full_names;
      const userPhone = memberData.phone_number || '';
      
      setUserRole('member');
      setUserId(userId);
      setUserName(userName);
      localStorage.setItem('userRole', 'member');
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      if (userPhone) {
        localStorage.setItem('userPhone', userPhone);
      }
      setActiveTab('dashboard');
    } else {
      setActiveTab('login');
    }
  };

  const handleLogin = (role, id, name = '', phoneNumber = '') => {
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    if (phoneNumber) {
      localStorage.setItem('userPhone', phoneNumber);
    }
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserId(null);
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    setActiveTab('login');
  };
  
  const handleFooterClick = (page) => {
    setActiveTab(page);
  };
  
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="app-container" style={{ padding: '0' }}>
      <nav style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '8px',
        borderRadius: '0',
        marginBottom: '5px',
        boxShadow: 'none',
        position: 'sticky',
        top: '0',
        zIndex: '1000',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <h1 style={{textAlign: 'center', color: 'white', margin: '0 0 8px 0', fontSize: 'clamp(0.85em, 3vw, 1.2em)', fontWeight: '700', lineHeight: '1.2', padding: '0 5px'}}>Mbogo Welfare Empowerment Foundation</h1>
        {userRole && (
          <>
            <div style={{textAlign: 'center', color: 'white', marginBottom: '5px', fontSize: 'clamp(10px, 2.5vw, 12px)', padding: '0 5px', wordBreak: 'break-word'}}>
              Welcome, {userName} ({userRole})
              <button onClick={handleLogout} style={{marginLeft: '5px', padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '3px', cursor: 'pointer', fontSize: 'clamp(10px, 2.5vw, 12px)'}}>Logout</button>
            </div>
<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', padding: '0 5px'}}>
              <button className="nav-button" onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('members')}>Members</button>}
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('datacapture')}>Data Capture</button>}
              <button className="nav-button" onClick={() => setActiveTab('minutes')}>Minutes</button>
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('database')}>Database</button>}
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('messaging')}>SMS</button>}
              <button className="nav-button" onClick={() => setActiveTab('meetings')}>Meetings</button>
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('admin')}>Admin</button>}
              <button className="nav-button" onClick={() => setActiveTab('donate')}>Donate</button>
            </div>
          </>
        )}
      </nav>

      {!userRole && activeTab === 'landing' && <LandingPage onGetStarted={() => setActiveTab('signup')} onLogin={() => setActiveTab('login')} />}
      {!userRole && activeTab === 'about' && <AboutUs />}
      {!userRole && activeTab === 'contact' && <ContactUs />}
      {!userRole && activeTab === 'faq' && <FAQ />}
      {!userRole && activeTab === 'terms' && <Terms />}
      {!userRole && activeTab === 'privacy' && <Privacy />}
      {!userRole && activeTab === 'signup' && <SignUpPage onSignUpSuccess={handleSignUpSuccess} onNavigate={setActiveTab} />}
      {!userRole && activeTab === 'registration' && <EnhancedRegistrationPro signupPhone={signupPhone} onRegistrationSuccess={handleRegistrationSuccess} />}
      {!userRole && activeTab === 'confirmation' && <MembershipConfirmation memberData={memberData} onContinue={handleConfirmationContinue} />}
      {!userRole && activeTab === 'login' && <LoginPage onLogin={handleLogin} onNavigate={setActiveTab} />}
{userRole && activeTab === 'dashboard' && <UserDashboard />}
      {userRole && activeTab === 'home' && <HomePage />}
      {userRole && activeTab === 'registration' && <EnhancedRegistrationPro onRegistered={() => setRefresh(!refresh)} />}
      {userRole && activeTab === 'members' && <MembersList key={refresh} userRole={userRole} userId={userId} />}
      {userRole && activeTab === 'datacapture' && <DataCapture />}
{userRole && activeTab === 'minutes' && <MeetingMinutes userRole={userRole} userId={userId} />}
      {userRole && activeTab === 'meetings' && <MeetingList />}
{userRole && activeTab === 'database' && userRole === 'admin' && <DatabaseViewer userRole={userRole} userId={userId} />}
{userRole && activeTab === 'messaging' && userRole === 'admin' && <BulkMessaging userRole={userRole} userId={userId} />}
      {userRole === 'admin' && activeTab === 'admin' && <AdminDashboard />}
      {userRole && activeTab === 'about' && <AboutUs />}
      {userRole && activeTab === 'contact' && <ContactUs />}
      {userRole && activeTab === 'faq' && <FAQ />}
      {userRole && activeTab === 'terms' && <Terms />}
      {userRole && activeTab === 'donate' && <Donate />}
      
      {userRole && (
        <footer style={{
          marginTop: '15px',
          padding: '12px 8px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          borderRadius: '0',
          boxShadow: 'none',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px', 
            flexWrap: 'wrap', 
            marginBottom: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            paddingBottom: '10px'
          }}>
            {[
              {label: 'About Us', page: 'about'},
              {label: 'Contact Us', page: 'contact'},
              {label: 'FAQ', page: 'faq'},
              {label: 'Terms & Conditions', page: 'terms'},
              {label: 'Privacy Policy', page: 'privacy'}
            ].map(link => (
              <span key={link.label} 
                onClick={() => handleFooterClick(link.page)}
                style={{
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(10px, 2.5vw, 12px)'
                }} 
                onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.target.style.background = 'transparent'}>
                {link.label}
              </span>
            ))}
          </div>
          <p style={{margin: '0', fontSize: 'clamp(9px, 2vw, 11px)', opacity: '0.95', fontWeight: '500'}}>
            &copy; 2025 Mbogo Welfare Empowerment Foundation. Empowering communities through transparency and trust.
          </p>
        </footer>
      )}
      <Watermark />
    </div>
  );
}

export default App;

