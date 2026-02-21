import React from 'react';

function LandingPage({ onGetStarted, onLogin }) {
  const navigateTo = (page) => {
    window.location.hash = `#${page}`;
  };

  return (
    <div className="form-container">
      <div style={{
        background: '#0A2463',
        padding: '48px 32px',
        color: '#FFFFFF',
        marginBottom: '48px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '16px',
          fontWeight: '700',
          color: '#FFFFFF'
        }}>
          Welcome to Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{
          fontSize: '16px',
          marginBottom: '32px',
          fontWeight: '300',
          color: '#FFFFFF'
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
              background: '#FFFFFF',
              color: '#0A2463',
              fontWeight: '700'
            }}
            onClick={() => window.location.hash = '#signup'}
          >
            Get Started
          </button>
          <button 
            style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: '1px solid #FFFFFF'
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
        border: '1px solid #0A2463'
      }}>
        <h3 style={{marginBottom: '16px', color: '#0A2463'}}>Admin?</h3>
        <p style={{marginBottom: '24px', color: '#0A2463'}}>Register as an admin to manage the platform</p>
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
            border: '1px solid #0A2463',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <h3 style={{marginBottom: '16px', color: '#0A2463'}}>{feature.title}</h3>
            <p style={{color: '#0A2463'}}>{feature.desc}</p>
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
            <span style={{color: '#0A2463', marginRight: '8px', fontSize: '18px'}}>✓</span>
            <span style={{fontWeight: '600', color: '#0A2463'}}>{benefit}</span>
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
            border: '1px solid #0A2463',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <h3 style={{marginBottom: '16px', color: '#0A2463'}}>{mission.title}</h3>
            <p style={{color: '#0A2463'}}>{mission.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: '#0A2463',
        padding: '48px 32px',
        textAlign: 'center',
        color: '#FFFFFF',
        marginBottom: '48px'
      }}>
        <h2 style={{fontSize: '28px', marginBottom: '16px', fontWeight: '700', color: '#FFFFFF'}}>Ready to Join Our Community?</h2>
        <p style={{
          fontSize: '16px',
          marginBottom: '32px',
          fontWeight: '300',
          color: '#FFFFFF'
        }}>
          Register today and become a valued member
        </p>
        <button 
          style={{
            background: '#FFFFFF',
            color: '#0A2463',
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
          <h4 style={{marginBottom: '12px', color: '#0A2463'}}>Contact Us</h4>
          <p style={{color: '#0A2463'}}>Email: info@mbogowelfare.org</p>
          <p style={{color: '#0A2463'}}>Phone: +254 XXX XXX XXX</p>
        </div>
        <div>
          <h4 style={{marginBottom: '12px', color: '#0A2463'}}>Quick Links</h4>
          <p style={{cursor: 'pointer', color: '#0A2463'}} onClick={() => navigateTo('about')}>About Us</p>
          <p style={{cursor: 'pointer', color: '#0A2463'}} onClick={() => navigateTo('faq')}>FAQ</p>
          <p style={{cursor: 'pointer', color: '#0A2463'}} onClick={() => navigateTo('contact')}>Contact</p>
        </div>
        <div>
          <h4 style={{marginBottom: '12px', color: '#0A2463'}}>Legal</h4>
          <p style={{cursor: 'pointer', color: '#0A2463'}} onClick={() => navigateTo('terms')}>Terms & Conditions</p>
          <p style={{cursor: 'pointer', color: '#0A2463'}} onClick={() => navigateTo('privacy')}>Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
