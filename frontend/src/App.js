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
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import MembershipConfirmation from './components/MembershipConfirmation';
import Watermark from './components/Watermark';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [memberData, setMemberData] = useState(null);
  
  // Check for stored login info on app load
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

  const handleSignUpSuccess = (phone) => {
    setSignupPhone(phone);
    setActiveTab('registration');
  };

  const handleRegistrationSuccess = (data) => {
    setMemberData(data.member_data);
    setActiveTab('confirmation');
    
    // Send welcome SMS
    fetch('http://localhost:5000/send-welcome-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: data.member_data.phone_number,
        member_name: data.member_data.full_names
      })
    }).catch(() => {});
  };

  const handleConfirmationContinue = () => {
    setActiveTab('login');
  };

  const handleLogin = (role, id, name = '') => {
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserId(null);
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
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
    <div className="app-container" style={{ padding: '20px' }}>
      <nav style={{
        background: 'linear-gradient(45deg, #006064, #00838f)',
        padding: '15px 0',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{textAlign: 'center', color: 'white', margin: '0 0 15px 0', fontSize: '1.8em'}}>Mbogo Foundation</h1>
        {userRole && (
          <>
            <div style={{textAlign: 'center', color: 'white', marginBottom: '10px'}}>
              Welcome, {userName} ({userRole})
              <button onClick={handleLogout} style={{marginLeft: '10px', padding: '5px 10px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '5px', cursor: 'pointer'}}>Logout</button>
            </div>
            <div style={{textAlign: 'center'}}>
              <button className="nav-button" onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              {userRole === 'member' && <button className="nav-button" onClick={() => setActiveTab('registration')}>Join Us</button>}
              <button className="nav-button" onClick={() => setActiveTab('members')}>Members</button>
              <button className="nav-button" onClick={() => setActiveTab('datacapture')}>Data Capture</button>
              <button className="nav-button" onClick={() => setActiveTab('minutes')}>Minutes</button>
              <button className="nav-button" onClick={() => setActiveTab('database')}>Database</button>
              <button className="nav-button" onClick={() => setActiveTab('messaging')}>SMS</button>
              {userRole === 'admin' && <button className="nav-button" onClick={() => setActiveTab('admin')}>Admin</button>}
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
      {userRole && activeTab === 'minutes' && <MeetingMinutes />}
      {userRole && activeTab === 'database' && <DatabaseViewer />}
      {userRole && activeTab === 'messaging' && <BulkMessaging />}
      {userRole === 'admin' && activeTab === 'admin' && <AdminDashboard />}
      {userRole && activeTab === 'about' && <AboutUs />}
      {userRole && activeTab === 'contact' && <ContactUs />}
      {userRole && activeTab === 'faq' && <FAQ />}
      {userRole && activeTab === 'terms' && <Terms />}
      {userRole && activeTab === 'privacy' && <Privacy />}
      
      {userRole && (
        <footer style={{
          marginTop: '50px',
          padding: '20px',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #006064, #00838f)',
          color: 'white',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '30px', 
            flexWrap: 'wrap', 
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            paddingBottom: '15px'
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
                  fontSize: '14px'
                }} 
                onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.target.style.background = 'transparent'}>
                {link.label}
              </span>
            ))}
          </div>
          <p style={{margin: '0', fontSize: '14px', opacity: '0.9'}}>
            &copy; 2025 Mbogo Foundation. Empowering communities through transparency and trust.
          </p>
        </footer>
      )}
      <Watermark />
    </div>
  );
}

export default App;