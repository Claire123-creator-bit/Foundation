import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

// Icons as components for reusability
const IconCheck = () => <span style={{color: '#00c853', marginRight: '8px'}}>✓</span>;
const IconFeature = ({name}) => {
  const icons = {
    'Member Registration': '📁',
    'Meeting Management': '📅',
    'Bulk Messaging': '💬',
    'Data Capture': '📊',
    'Database Viewer': '🗄️',
    'Admin Dashboard': '🔧'
  };
  return <span style={{fontSize: '28px'}}>{icons[name] || '⭐'}</span>;
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
    { title: 'Member Registration', desc: 'Easy and secure registration process for all community members' },
    { title: 'Meeting Management', desc: 'Schedule and track all community meetings efficiently' },
    { title: 'Bulk Messaging', desc: 'Send SMS notifications to all members instantly' },
    { title: 'Data Capture', desc: 'Collect and manage member data securely' },
    { title: 'Database Viewer', desc: 'Access and view all community records' },
    { title: 'Admin Dashboard', desc: 'Complete control over all platform features' }
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

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Welcome to Mbogo Welfare Empowerment Foundation
          </h1>
          <p style={styles.heroSubtitle}>
            Empowering communities through transparency, trust, and unity. 
            Join us in building a stronger, more connected community.
          </p>
          <div style={styles.heroButtons}>
            <button 
              style={styles.primaryButton}
              onClick={onGetStarted}
            >
              Get Started
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={onLogin}
            >
              Login
            </button>
          </div>
        </div>
        <div style={styles.heroOverlay}></div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Our Features</h2>
        <p style={styles.sectionSubtitle}>
          Everything you need to manage your community effectively
        </p>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <IconFeature name={feature.title} />
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section style={styles.benefitsSection}>
        <h2 style={styles.sectionTitle}>Why Join Us?</h2>
        <p style={styles.sectionSubtitle}>
          Discover the benefits of being part of the Mbogo Welfare community
        </p>
        <div style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-item" style={styles.benefitItem}>
              <IconCheck />
              <span style={styles.benefitText}>{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section style={styles.missionSection}>
        <h2 style={styles.sectionTitle}>Our Mission</h2>
        <div style={styles.missionCards}>
          <div className="mission-card" style={styles.missionCard}>
            <h3 style={styles.missionCardTitle}>Transparency</h3>
            <p style={styles.missionCardText}>
              We believe in open and honest communication with all our members. 
              Every decision and financial transaction is shared with the community.
            </p>
          </div>
          <div className="mission-card" style={styles.missionCard}>
            <h3 style={styles.missionCardTitle}>Community</h3>
            <p style={styles.missionCardText}>
              Building strong bonds between community members through regular 
              meetings, events, and collaborative initiatives.
            </p>
          </div>
          <div className="mission-card" style={styles.missionCard}>
            <h3 style={styles.missionCardTitle}>Empowerment</h3>
            <p style={styles.missionCardText}>
              Providing resources, education, and support to help all members 
              achieve their full potential and improve their quality of life.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Join Our Community?</h2>
        <p style={styles.ctaText}>
          Take the first step towards being part of something bigger. 
          Register today and become a valued member of the Mbogo Welfare Foundation.
        </p>
        <button 
          style={styles.primaryButton}
          onClick={onGetStarted}
        >
          Register Now
        </button>
      </section>

      {/* Admin Login Section */}
      <section style={styles.adminSection}>
        <div style={styles.adminCard}>
          <h3 style={styles.adminTitle}>Admin Login</h3>
          <form onSubmit={handleAdminLoginSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  style={styles.checkbox}
                />
                Show Password
              </label>
            </div>
            <button 
              type="submit" 
              style={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
            {message && (
              <p style={message.includes('failed') || message.includes('error') ? styles.errorMessage : styles.successMessage}>
                {message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer Info */}
      <section style={styles.infoSection}>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <h4 style={styles.infoTitle}>Contact Us</h4>
            <p style={styles.infoText}>Email: info@mbogowelfare.org</p>
            <p style={styles.infoText}>Phone: +254 XXX XXX XXX</p>
          </div>
          <div style={styles.infoItem}>
            <h4 style={styles.infoTitle}>Quick Links</h4>
            <p style={styles.infoLink} onClick={() => navigateTo('about')}>About Us</p>
            <p style={styles.infoLink} onClick={() => navigateTo('faq')}>FAQ</p>
            <p style={styles.infoLink} onClick={() => navigateTo('contact')}>Contact</p>
          </div>
          <div style={styles.infoItem}>
            <h4 style={styles.infoTitle}>Legal</h4>
            <p style={styles.infoLink} onClick={() => navigateTo('terms')}>Terms & Conditions</p>
            <p style={styles.infoLink} onClick={() => navigateTo('privacy')}>Privacy Policy</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    margin: '0',
    padding: '0',
  },
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
    padding: '80px 20px',
    textAlign: 'center',
    color: 'white',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 'clamp(1.8em, 5vw, 3em)',
    marginBottom: '20px',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    animation: 'fadeInUp 1s ease-out',
  },
  heroSubtitle: {
    fontSize: 'clamp(1em, 2.5vw, 1.3em)',
    marginBottom: '40px',
    opacity: 0.95,
    lineHeight: '1.6',
    animation: 'fadeInUp 1s ease-out 0.2s both',
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    animation: 'fadeInUp 1s ease-out 0.4s both',
  },
  primaryButton: {
    padding: '15px 40px',
    fontSize: '1.1em',
    fontWeight: '600',
    backgroundColor: '#00c853',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,200,83,0.4)',
  },
  secondaryButton: {
    padding: '15px 40px',
    fontSize: '1.1em',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  featuresSection: {
    padding: '80px 20px',
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 'clamp(1.8em, 4vw, 2.5em)',
    textAlign: 'center',
    color: '#1e3c72',
    marginBottom: '15px',
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 'clamp(1em, 2vw, 1.2em)',
    textAlign: 'center',
    color: '#666',
    marginBottom: '50px',
    maxWidth: '600px',
    margin: '0 auto 50px auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e0e0e0',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '1.3em',
    color: '#1e3c72',
    marginBottom: '15px',
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: '1em',
    color: '#666',
    lineHeight: '1.6',
  },
  benefitsSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px 25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  benefitText: {
    fontSize: '1.1em',
    color: '#333',
    fontWeight: '500',
  },
  missionSection: {
    padding: '80px 20px',
    backgroundColor: 'white',
  },
  missionCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px',
  },
  missionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '15px',
    padding: '35px',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    borderTop: '4px solid #1e3c72',
  },
  missionCardTitle: {
    fontSize: '1.4em',
    color: '#1e3c72',
    marginBottom: '20px',
    fontWeight: '700',
  },
  missionCardText: {
    fontSize: '1em',
    color: '#555',
    lineHeight: '1.7',
  },
  ctaSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    textAlign: 'center',
    color: 'white',
  },
  ctaTitle: {
    fontSize: 'clamp(1.5em, 4vw, 2.2em)',
    marginBottom: '20px',
    fontWeight: '700',
  },
  ctaText: {
    fontSize: 'clamp(1em, 2vw, 1.2em)',
    marginBottom: '35px',
    maxWidth: '600px',
    margin: '0 auto 35px auto',
    opacity: 0.95,
    lineHeight: '1.6',
  },
  adminSection: {
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
  },
  adminCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #e0e0e0',
  },
  adminTitle: {
    fontSize: '1.5em',
    color: '#1e3c72',
    marginBottom: '25px',
    textAlign: 'center',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '1em',
    border: '2px solid #ddd',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
  },
  checkboxGroup: {
    marginBottom: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95em',
    color: '#555',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  loginButton: {
    padding: '14px',
    fontSize: '1.1em',
    fontWeight: '600',
    backgroundColor: '#1e3c72',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
  successMessage: {
    color: '#00c853',
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: '500',
  },
  errorMessage: {
    color: '#ff1744',
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: '500',
  },
  infoSection: {
    padding: '50px 20px',
    backgroundColor: '#1e3c72',
    color: 'white',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 20px',
  },
  infoItem: {
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: '1.2em',
    marginBottom: '15px',
    fontWeight: '600',
  },
  infoText: {
    fontSize: '0.95em',
    margin: '5px 0',
    opacity: 0.9,
  },
  infoLink: {
    fontSize: '0.95em',
    margin: '8px 0',
    opacity: 0.9,
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  },
};

export default LandingPage;

