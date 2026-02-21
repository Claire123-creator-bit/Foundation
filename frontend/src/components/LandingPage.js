import React from 'react';

function LandingPage({ onGetStarted, onLogin }) {
  const navigateTo = (page) => {
    window.location.hash = `#${page}`;
  };

  return (
    <div className="form-container">
      <div style={{
        background: '#D4735E',
        padding: '48px 32px',
        color: '#FAF7F5',
        marginBottom: '48px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '16px',
          fontWeight: '700',
          color: '#FAF7F5'
        }}>
          Welcome to Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{
          fontSize: '16px',
          marginBottom: '32px',
          fontWeight: '300',
          color: '#FAF7F5'
        }}>
          Empowering communities through transparency, trust, and unity
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button 
            style={{
              background: '#FAF7F5',
              color: '#D4735E',
              fontWeight: '700'
            }}
            onClick={() => window.location.hash = '#signup'}
          >
            Get Started
          </button>
          <button 
            style={{
              background: 'transparent',
              color: '#FAF7F5',
              border: '1px solid #FAF7F5'
            }}
            onClick={() => window.location.hash = '#login'}
          >
            Login
          </button>
        </div>
      </div>

      <div style={{
        background: '#FFFFFF',
        padding: '32px',
        marginBottom: '48px',
        textAlign: 'center',
        border: '1px solid #D4735E'
      }}>
        <h3 style={{marginBottom: '16px'}}>Admin?</h3>
        <p style={{marginBottom: '24px'}}>Register as an admin to manage the platform</p>
        <button onClick={() => window.location.hash = '#admin-signup'}>
          Admin Sign Up
        </button>
      </div>

      <h2 className="section-title">Our Features</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 250px))',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '48px'
      }}>
        {[
          { title: 'Member Registration', desc: 'Easy and secure registration process' },
          { title: 'Meeting Management', desc: 'Schedule and track all meetings' },
          { title: 'Bulk Messaging', desc: 'Send SMS notifications instantly' },
          { title: 'Data Capture', desc: 'Collect and manage member data' }
        ].map((feature, index) => (
          <div key={index} style={{
            width: '250px',
            height: '250px',
            background: '#FFFFFF',
            border: '1px solid #D4735E',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <h3 style={{marginBottom: '16px'}}>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Why Join Us?</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '48px'
      }}>
        {['Community Support', 'Transparent Governance', 'Member Benefits', 'Regular Updates', 'Networking', 'Empowerment'].map((benefit, index) => (
          <div key={index} className="info-card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{color: '#D4735E', marginRight: '8px', fontSize: '18px'}}>✓</span>
            <span style={{fontWeight: '600'}}>{benefit}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Our Mission</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '48px'
      }}>
        {[
          { title: 'Transparency', desc: 'Open and honest communication with all members. Every decision is shared with the community.' },
          { title: 'Community', desc: 'Building strong bonds through regular meetings, events, and collaborative initiatives.' },
          { title: 'Empowerment', desc: 'Providing resources and support to help members achieve their full potential.' }
        ].map((mission, index) => (
          <div key={index} style={{
            width: '300px',
            height: '300px',
            background: '#FFFFFF',
            border: '1px solid #D4735E',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <h3 style={{marginBottom: '16px'}}>{mission.title}</h3>
            <p>{mission.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: '#D4735E',
        padding: '48px 32px',
        textAlign: 'center',
        color: '#FAF7F5',
        marginBottom: '48px'
      }}>
        <h2 style={{fontSize: '28px', marginBottom: '16px', fontWeight: '700', color: '#FAF7F5'}}>Ready to Join Our Community?</h2>
        <p style={{
          fontSize: '16px',
          marginBottom: '32px',
          fontWeight: '300',
          color: '#FAF7F5'
        }}>
          Register today and become a valued member
        </p>
        <button 
          style={{
            background: '#FAF7F5',
            color: '#D4735E',
            fontWeight: '700'
          }}
          onClick={() => window.location.hash = '#signup'}
        >
          Register Now
        </button>
      </div>

      <div className="info-card" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        textAlign: 'center'
      }}>
        <div>
          <h4 style={{marginBottom: '12px'}}>Contact Us</h4>
          <p>Email: info@mbogowelfare.org</p>
          <p>Phone: +254 XXX XXX XXX</p>
        </div>
        <div>
          <h4 style={{marginBottom: '12px'}}>Quick Links</h4>
          <p style={{cursor: 'pointer', color: '#D4735E'}} onClick={() => navigateTo('about')}>About Us</p>
          <p style={{cursor: 'pointer', color: '#D4735E'}} onClick={() => navigateTo('faq')}>FAQ</p>
          <p style={{cursor: 'pointer', color: '#D4735E'}} onClick={() => navigateTo('contact')}>Contact</p>
        </div>
        <div>
          <h4 style={{marginBottom: '12px'}}>Legal</h4>
          <p style={{cursor: 'pointer', color: '#D4735E'}} onClick={() => navigateTo('terms')}>Terms & Conditions</p>
          <p style={{cursor: 'pointer', color: '#D4735E'}} onClick={() => navigateTo('privacy')}>Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
