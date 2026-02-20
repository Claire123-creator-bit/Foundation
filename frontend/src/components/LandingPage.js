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
    window.location.hash = `#${page}`;
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

      {/* Hero: two-column layout */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>M</span>
          </div>
          <h1 style={styles.title}>Mbogo Welfare Empowerment Foundation</h1>
          <p style={styles.subtitle}>Empowering communities through transparency and trust</p>

          <p style={{color: 'rgba(255,255,255,0.85)', maxWidth: '560px', marginTop: '20px', lineHeight: '1.6'}}>
            Join a community-driven platform that makes governance transparent and participation easy. Manage members, meetings, donations, and communications — all in one place.
          </p>

          <div style={{marginTop: '26px', display: 'flex', gap: '14px', flexWrap: 'wrap'}}>
            <button onClick={() => { window.location.hash = '#signup'; }} style={styles.ctaButton}>Get Started</button>
            <button onClick={() => { window.location.hash = '#about'; }} style={{padding: '12px 22px', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer'}}>Learn More</button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={{background: 'white', padding: '22px', borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)'}}>
            <div style={styles.tabContainer}>
              <button 
                onClick={() => { setActiveTab('register'); setMessage(''); }} 
                style={styles.tabButton(activeTab === 'register', 'register')}
              >
                Register
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
                Admin
              </button>
            </div>

            <div style={{marginTop: '18px'}}>
              {activeTab === 'register' && (
                <div>
                  <h3 style={{color: '#006064', marginBottom: '12px'}}>Join as a member</h3>
                  <p style={{color: '#666', marginBottom: '12px'}}>Create an account to participate in meetings and access member resources.</p>
                  <button onClick={() => { window.location.hash = '#signup'; }} style={styles.ctaButton}>Register Now</button>
                </div>
              )}

              {activeTab === 'login' && (
                <div>
                  <h3 style={{color: '#006064', marginBottom: '12px'}}>Member Login</h3>
                  <p style={{color: '#666', marginBottom: '12px'}}>Access your dashboard and profile.</p>
                  <button onClick={() => { window.location.hash = '#login'; }} style={styles.ctaButton}>Member Login</button>
                </div>
              )}

              {activeTab === 'admin' && (
                <div>
                  <h3 style={{color: '#ff9800', marginBottom: '12px'}}>Administrator</h3>
                  <p style={{color: '#666', marginBottom: '12px'}}>Admin tools for managing the platform.</p>
                  <button onClick={() => { window.location.hash = '#admin-login'; }} style={{...styles.ctaButton, background: 'linear-gradient(45deg, #ff9800, #f57c00)'}}>Admin Login</button>
                </div>
              )}
            </div>
          </div>

          <div style={{marginTop: '18px'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
              {features.slice(0,4).map((f, i) => (
                <div key={i} style={{padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', color: 'white'}}>
                  <strong style={{display: 'block', marginBottom: '6px'}}>{f.title}</strong>
                  <small style={{opacity: 0.85}}>{f.desc}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features and other sections remain below, unchanged for now */}

      <div id="features" style={{padding: '30px 20px', background: 'linear-gradient(135deg, rgba(0,188,212,0.05) 0%, rgba(0,151,167,0.02) 100%)', borderRadius: '20px', marginBottom: '30px'}}>
        <h2 style={{color: '#006064', marginBottom: '20px', fontSize: '1.5em'}}>Platform Features</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px'}}>
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card" style={{padding: '15px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '3px solid #00bcd4', textAlign: 'left'}}>
              <h4 style={{color: '#006064', marginBottom: '5px', fontSize: '0.95em'}}>{feature.title}</h4>
              <p style={{color: '#666', fontSize: '0.8em', margin: 0}}>{feature.desc}</p>
            </div>
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
