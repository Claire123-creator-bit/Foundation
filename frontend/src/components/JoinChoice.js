import React from 'react';
import './LandingPage.css';

const JoinChoice = ({ onBack, onRegister, onSignIn, onAdminLogin }) => {
  return (
    <div>
      <nav className="landing-navbar">
        <div className="landing-navbar-desktop">
          <div className="landing-logo" style={{ cursor: 'default' }}>
            <img src={'/mbogo-background.jpeg'} alt="Mbogo Foundation" className="landing-logo-image" />
            <span className="landing-logo-text">Mbogo Foundation</span>
          </div>

          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => window.scrollTo(0, 0)}>About</button>
            <button className="landing-nav-link" onClick={() => window.scrollTo(0, 0)}>What We Do</button>
            <button className="landing-nav-link" onClick={() => window.scrollTo(0, 0)}>Activities</button>
            <button className="landing-nav-link" onClick={() => window.scrollTo(0, 0)}>Media</button>
            <button className="landing-nav-link" onClick={() => window.scrollTo(0, 0)}>Contact</button>
            <button className="landing-join-button" onClick={() => {}}>
              Join Us Now
            </button>
            <button className="landing-admin-btn" onClick={onAdminLogin}>Admin</button>
          </div>

          <div className="landing-menu-container" />
        </div>
      </nav>

      <main style={{ paddingTop: 96, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="landing-card" style={{ maxWidth: 540, width: '100%', padding: 32, textAlign: 'center' }}>
          <h2 style={{ marginTop: 0, color: '#0A2463' }}>Welcome to Mbogo Welfare Empowerment Foundation</h2>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button
              className="landing-join-button"
              onClick={onRegister}
              style={{ padding: '10px 28px' }}
            >
              Register
            </button>

            <button
              className="landing-admin-btn"
              onClick={onSignIn}
              style={{ padding: '10px 28px' }}
            >
              Sign In
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0A2463', cursor: 'pointer', textDecoration: 'underline' }}>Back to Home</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <img
                src="/mbogo-background.jpeg"
                alt="logo"
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)' }}
              />
              <div>
                <div className="footer-name">Mbogo Welfare Empowerment Foundation</div>
                <div className="footer-tagline">Empowering Communities Through Unity</div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} Mbogo Welfare Empowerment Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JoinChoice;
