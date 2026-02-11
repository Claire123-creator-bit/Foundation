import React from 'react';

function LandingPage({ onGetStarted, onLogin }) {
  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="form-container">
      <div style={{textAlign: 'center', padding: '10px'}}>
        <h1 style={{
          fontSize: '1.2em',
          background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{fontSize: '0.9em', color: '#666', marginBottom: '15px'}}>
          Empowering communities through transparency and trust
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '5px',
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}>
          {[
            {label: 'About', page: 'about'},
            {label: 'Contact', page: 'contact'},
            {label: 'FAQ', page: 'faq'},
            {label: 'Terms', page: 'terms'},
            {label: 'Privacy', page: 'privacy'}
          ].map(item => (
            <button key={item.page} onClick={() => handleNavigation(item.page)} style={{
              padding: '6px 12px',
              background: 'rgba(30, 60, 114, 0.1)',
              color: '#1e3c72',
              border: '1px solid rgba(30, 60, 114, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '11px'
            }}>
              {item.label}
            </button>
          ))}
        </div>

        <div id="features" style={{
          padding: '15px 10px',
          background: 'linear-gradient(135deg, rgba(30,60,114,0.05) 0%, rgba(42,82,152,0.02) 100%)',
          borderRadius: '10px',
          marginBottom: '15px'
        }}>
          <h2 style={{color: '#1e3c72', marginBottom: '10px', fontSize: '1.1em'}}>Platform Features</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '8px',
            marginBottom: '10px'
          }}>
            {[
              {title: 'Member Registration', desc: 'Easy registration with location tracking'},
              {title: 'Meeting Management', desc: 'Schedule and track meetings'},
              {title: 'Bulk Messaging', desc: 'Send SMS to members'},
              {title: 'Data Capture', desc: 'Collect member data'},
              {title: 'Database Viewer', desc: 'View all records'},
              {title: 'Admin Dashboard', desc: 'Administrative control'}
            ].map((feature, idx) => (
              <div key={idx} style={{
                padding: '10px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                borderLeft: '3px solid #1e3c72',
                textAlign: 'left'
              }}>
                <h4 style={{color: '#1e3c72', marginBottom: '5px', fontSize: '0.9em'}}>{feature.title}</h4>
                <p style={{color: '#666', fontSize: '0.75em', margin: 0}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="about" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h3 style={{fontSize: '1em', marginBottom: '8px'}}>Our Mission</h3>
            <p style={{lineHeight: '1.4', opacity: '0.95', fontSize: '0.8em'}}>
              Building stronger communities through transparent governance.
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h3 style={{fontSize: '1em', marginBottom: '8px'}}>Get Involved</h3>
            <p style={{lineHeight: '1.4', opacity: '0.95', fontSize: '0.8em'}}>
              Join our programs and make a difference in your community.
            </p>
          </div>
        </div>

        <div style={{display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '15px'}}>
          <button onClick={onGetStarted} style={{
            padding: '10px 20px',
            fontSize: '0.9em',
            background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
            borderRadius: '8px'
          }}>
            Get Started
          </button>
          <button onClick={onLogin} style={{
            padding: '10px 20px',
            fontSize: '0.9em',
            background: 'linear-gradient(45deg, #2a5298, #1e3c72)',
            borderRadius: '8px'
          }}>
            Member Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
