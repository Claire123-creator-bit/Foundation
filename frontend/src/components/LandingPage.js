import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

// Icons as components for reusability
const IconCheck = () => <span style={{color: '#00c853', marginRight: '8px'}}>✓</span>;
const IconFeature = ({name}) => {
  const icons = {
    'Member Registration': '\uD83D\uDCC4',
    'Meeting Management': '\uD83D\uDCC5',
    'Bulk Messaging': '\uD83D\uDCAC',
    'Data Capture': '\uD83D\uDCCA',
    'Database Viewer': '\uD83D\uDCC4',
    'Admin Dashboard': '\uD83C\uDF9B'
  };
  return <span style={{fontSize: '28px'}}>{icons[name] || '\u2B50'}</span>;
};

function LandingPage({ onGetStarted, onLogin }) {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  const navigateTo = (page) => {
    window.location.hash = page;
    setTimeout(() => { window.location.reload(); }, 100);
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Logging in...');

    try {
      const response = await fetch(`${API_BASE}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name);
        window.location.hash = '#dashboard';
        window.location.reload();
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Connection error');
    }
    setLoading(false);
  };

  const features = [
    { title: 'Member Registration', desc: 'Easy registration' },
    { title: 'Meeting Management', desc: 'Track meetings' },
    { title: 'Bulk Messaging', desc: 'Send SMS' },
    { title: 'Data Capture', desc: 'Manage data' },
    { title: 'Database Viewer', desc: 'View records' },
    { title: 'Admin Dashboard', desc: 'Full control' }
  ];

  const benefits = [
    'Community Support',
    'Transparent Governance',
    'Member Benefits',
    'Regular Updates',
    'Networking',
    'Empowerment'
  ];

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        input:focus {
          outline: none;
          border-color: #00c853 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(0,200,83,0.15) !important;
        }
        button:hover {
          transform: translateY(-2px);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25) !important;
        }
        .benefit-item:hover {
          transform: scale(1.03);
          background: white !important;
        }
        .mission-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
      
      <div style={styles.backgroundPattern}></div>
      
      {/* Logo and Title */}
      <div style={styles.logoSection}>
        <div style={styles.logoCircle}>
          <span style={styles.logoText}>M</span>
        </div>
        <h1 style={styles.title}>Mbogo Welfare Empowerment Foundation</h1>
        <p style={styles.subtitle}>Empowering communities through transparency and trust</p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => { setActiveTab('register'); setMessage(''); }} 
          style={styles.tabButton(activeTab === 'register', 'register')}
        >
          Register as Member
        </button>
        <button 
          onClick={() => { setActiveTab('login'); setMessage(''); }} 
          style={styles.tabButton(activeTab === 'login', 'login')}
        >
          Member Login
        </button>
        <button 
          onClick={() => { setActiveTab('admin'); setMessage(''); }} 
          style={styles.tabButton(activeTab === 'admin', 'admin')}
        >
          Admin Login
        </button>
      </div>

        {/* Registration Form - Redirects to SignUpPage for proper flow */}
        {activeTab === 'register' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#006064', marginBottom: '20px', textAlign: 'center'}}>Register as a Member</h2>
            <p style={{color: '#666', marginBottom: '20px', textAlign: 'center'}}>Join our community to access member benefits, meetings, and more.</p>
            <div style={{textAlign: 'center'}}>
              <button 
                onClick={() => { window.location.hash = '#signup'; window.location.reload(); }} 
                style={{padding: '15px 40px', background: 'linear-gradient(45deg, #006064, #00838f)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}
              >
                Get Started - Register Now
              </button>
            </div>
            <div style={{textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,96,100,0.05)', borderRadius: '10px'}}>
              <p style={{margin: 0, color: '#006064', fontSize: '13px'}}>Already registered? <span onClick={() => { setActiveTab('login'); }} style={{color: '#00838f', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}}>Login here</span></p>
            </div>
          </div>
        )}

        {/* Member Login Form - Redirects to LoginPage for proper flow */}
        {activeTab === 'login' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#006064', marginBottom: '20px', textAlign: 'center'}}>Member Login</h2>
            <p style={{color: '#666', marginBottom: '20px', textAlign: 'center'}}>Access your member dashboard and manage your profile.</p>
            <div style={{textAlign: 'center'}}>
              <button 
                onClick={() => { window.location.hash = '#login'; window.location.reload(); }} 
                style={{padding: '15px 40px', background: 'linear-gradient(45deg, #006064, #00838f)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}
              >
                Login to Member Portal
              </button>
            </div>
            <div style={{textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,96,100,0.05)', borderRadius: '10px'}}>
              <p style={{margin: 0, color: '#006064', fontSize: '13px'}}>New member? <span onClick={() => { setActiveTab('register'); }} style={{color: '#00838f', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}}>Register here</span></p>
            </div>
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === 'admin' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#ff9800', marginBottom: '20px', textAlign: 'center'}}>Admin Login</h2>
            <form onSubmit={handleAdminLoginSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required placeholder="Enter admin username" />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <div style={{position: 'relative'}}>
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Enter admin password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px'}}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{width: '100%', padding: '15px', background: 'linear-gradient(45deg, #ff9800, #f57c00)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}>{loading ? 'Logging in...' : 'Admin Login'}</button>
            </form>
            {message && <div style={{marginTop: '15px', padding: '10px', borderRadius: '5px', background: '#ffebee', color: '#c62828'}}>{message}</div>}
            <div style={{textAlign: 'center', marginTop: '15px', padding: '15px', background: 'rgba(255,152,0,0.1)', borderRadius: '10px'}}>
              <p style={{margin: '0', color: '#e65100', fontSize: '13px'}}>New administrator? <span onClick={() => navigateTo('admin-signup')} style={{color: '#006064', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}}>Register here</span></p>
            </div>
          </div>
        )}

        {/* Info Links */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px'}}>
          {[
            {label: 'About Us', page: 'about'},
            {label: 'Contact Us', page: 'contact'},
            {label: 'FAQ', page: 'faq'},
            {label: 'Terms & Conditions', page: 'terms'},
            {label: 'Privacy Policy', page: 'privacy'}
          ].map(item => (
            <button key={item.page} onClick={() => handleNavigation(item.page)} style={{padding: '8px 16px', background: 'rgba(0, 96, 100, 0.1)', color: '#006064', border: '1px solid rgba(0, 96, 100, 0.3)', borderRadius: '15px', cursor: 'pointer', fontSize: '12px'}}>{item.label}</button>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" style={{padding: '30px 20px', background: 'linear-gradient(135deg, rgba(0,188,212,0.05) 0%, rgba(0,151,167,0.02) 100%)', borderRadius: '20px', marginBottom: '30px'}}>
          <h2 style={{color: '#006064', marginBottom: '20px', fontSize: '1.5em'}}>Platform Features</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px'}}>
            {[
              {title: 'Member Registration', desc: 'Easy registration'},
              {title: 'Meeting Management', desc: 'Track meetings'},
              {title: 'Bulk Messaging', desc: 'Send SMS'},
              {title: 'Data Capture', desc: 'Manage data'},
              {title: 'Database Viewer', desc: 'View records'},
              {title: 'Admin Dashboard', desc: 'Full control'}
            ].map((feature, idx) => (
              <div key={idx} style={{padding: '15px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '3px solid #00bcd4', textAlign: 'left'}}>
                <h4 style={{color: '#006064', marginBottom: '5px', fontSize: '0.95em'}}>{feature.title}</h4>
                <p style={{color: '#666', fontSize: '0.8em', margin: 0}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mission Section */}
        <div id="about" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px'}}>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Our Mission</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Building stronger communities through transparent governance.</p>
          </div>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #0097a7 0%, #00838f 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Get Involved</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Join our programs and make a difference.</p>
          </div>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #00acc1 0%, #006064 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Support Us</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Contribute through donations and volunteering.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" style={{padding: '30px', background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(0,151,167,0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(0,188,212,0.2)', marginBottom: '20px'}}>
          <h2 style={{color: '#006064', marginBottom: '15px'}}>Why Join Us?</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', textAlign: 'left'}}>
            {['✓ Community Support', '✓ Transparent Governance', '✓ Member Benefits', '✓ Regular Updates', '✓ Networking', '✓ Empowerment'].map((item, idx) => (
              <div key={idx} style={{padding: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: '0.9em', color: '#333'}}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    );
}

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0f2744 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px'
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 80%, rgba(0, 200, 83, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 188, 212, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 152, 0, 0.05) 0%, transparent 30%)
    `,
    pointerEvents: 'none'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1
  },
  logoCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c853 0%, #0097a7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    boxShadow: '0 10px 40px rgba(0, 200, 83, 0.4), 0 0 60px rgba(0, 200, 83, 0.2)',
    animation: 'pulse 2s infinite'
  },
  logoText: {
    color: 'white',
    fontSize: '42px',
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '2.2em',
    background: 'linear-gradient(135deg, #ffffff 0%, #00e676 50%, #00bcd4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    textShadow: 'none'
  },
  subtitle: {
    fontSize: '1.2em',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '0',
    fontWeight: '400'
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1
  },
  tabButton: (isActive, type) => ({
    padding: '14px 32px',
    background: isActive 
      ? type === 'admin' 
        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        : 'linear-gradient(135deg, #00c853 0%, #0097a7 100%)'
      : 'rgba(255,255,255,0.1)',
    color: 'white',
    border: `2px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.3)'}`,
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? '0 8px 25px rgba(0,200,83,0.4)' : 'none',
    backdropFilter: 'blur(10px)'
  })
};

export default LandingPage;
