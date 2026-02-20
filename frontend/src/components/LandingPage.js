import React from 'react';

// Icons as components for reusability
const IconCheck = () => <span style={{color: '#667eea', marginRight: '8px'}}>✓</span>;
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
  const navigateTo = (page) => {
    window.location.hash = `#${page}`;
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
    <div className="form-container">
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
          border-color: #667eea !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(102,126,234,0.15) !important;
        }
        button:hover {
          transform: translateY(-2px);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(102,126,234,0.25) !important;
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
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '50px 30px',
        borderRadius: '25px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8em, 5vw, 2.5em)',
          marginBottom: '20px',
          fontWeight: '700',
          animation: 'fadeInUp 1s ease-out',
        }}>
          Welcome to Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{
          fontSize: 'clamp(1em, 2.5vw, 1.2em)',
          marginBottom: '30px',
          opacity: 0.95,
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.2s both',
          maxWidth: '700px',
          margin: '0 auto 30px auto'
        }}>
          Empowering communities through transparency, trust, and unity. 
          Join us in building a stronger, more connected community.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          <button 
            style={{
              padding: '15px 40px',
              fontSize: '1.1em',
              fontWeight: '600',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
            onClick={() => window.location.hash = '#signup'}
          >
            Get Started
          </button>
          <button 
            style={{
              padding: '15px 40px',
              fontSize: '1.1em',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => window.location.hash = '#login'}
          >
            Login
          </button>
        </div>
      </div>

      {/* Admin Signup Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%)',
        padding: '30px 40px',
        borderRadius: '25px',
        boxShadow: '0 20px 60px rgba(102,126,234,0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102,126,234,0.2)',
        maxWidth: '420px',
        width: '100%',
        margin: '-20px auto 50px auto',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center'
      }}>
        <div style={{marginBottom: '20px'}}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 8px 25px rgba(102,126,234,0.4)'
          }}>🔐</div>
          <h3 style={{
            color: '#333',
            margin: '0 0 8px 0',
            fontSize: '1.5em',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Admin?</h3>
          <p style={{color: '#666', margin: '0', fontSize: '14px'}}>Register as an admin to manage the platform</p>
        </div>
        
        <button 
          onClick={() => window.location.hash = '#admin-signup'}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '700',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(102,126,234,0.4)'
          }}
        >
          Admin Sign Up
        </button>
      </div>

      {/* Features Section */}
      <h2 className="section-title">Our Features</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '35px', maxWidth: '600px', margin: '0 auto 35px auto'}}>
        Everything you need to manage your community effectively
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {features.map((feature, index) => (
          <div key={index} className="feature-card" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            padding: '30px',
            borderRadius: '25px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(102, 126, 234, 0.1)',
          }}>
            <div style={{fontSize: '48px', marginBottom: '20px'}}>
              <IconFeature name={feature.title} />
            </div>
            <h3 style={{color: '#667eea', marginBottom: '15px', fontWeight: '700', fontSize: '1.3em'}}>{feature.title}</h3>
            <p style={{color: '#666', lineHeight: '1.6', margin: 0}}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <h2 className="section-title">Why Join Us?</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '35px', maxWidth: '600px', margin: '0 auto 35px auto'}}>
        Discover the benefits of being part of the Mbogo Welfare community
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-item" style={{
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            padding: '20px 25px',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'default',
            border: '1px solid rgba(102, 126, 234, 0.1)',
          }}>
            <IconCheck />
            <span style={{color: '#333', fontWeight: '500', fontSize: '1.1em'}}>{benefit}</span>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <h2 className="section-title">Our Mission</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        <div className="mission-card" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          transition: 'all 0.3s ease',
          borderTop: '4px solid #667eea',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}>
          <h3 style={{color: '#667eea', marginBottom: '20px', fontWeight: '700', fontSize: '1.4em'}}>Transparency</h3>
          <p style={{lineHeight: '1.7', margin: 0}}>
            We believe in open and honest communication with all our members. 
            Every decision and financial transaction is shared with the community.
          </p>
        </div>
        <div className="mission-card" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          transition: 'all 0.3s ease',
          borderTop: '4px solid #764ba2',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}>
          <h3 style={{color: '#764ba2', marginBottom: '20px', fontWeight: '700', fontSize: '1.4em'}}>Community</h3>
          <p style={{lineHeight: '1.7', margin: 0}}>
            Building strong bonds between community members through regular 
            meetings, events, and collaborative initiatives.
          </p>
        </div>
        <div className="mission-card" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          transition: 'all 0.3s ease',
          borderTop: '4px solid #f093fb',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}>
          <h3 style={{color: '#f093fb', marginBottom: '20px', fontWeight: '700', fontSize: '1.4em'}}>Empowerment</h3>
          <p style={{lineHeight: '1.7', margin: 0}}>
            Providing resources, education, and support to help all members 
            achieve their full potential and improve their quality of life.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '50px 30px',
        borderRadius: '25px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '40px'
      }}>
        <h2 style={{fontSize: 'clamp(1.5em, 4vw, 2.2em)', marginBottom: '20px', fontWeight: '700'}}>Ready to Join Our Community?</h2>
        <p style={{
          fontSize: 'clamp(1em, 2vw, 1.2em)',
          marginBottom: '35px',
          maxWidth: '600px',
          margin: '0 auto 35px auto',
          opacity: 0.95,
          lineHeight: '1.6',
        }}>
          Take the first step towards being part of something bigger. 
          Register today and become a valued member of the Mbogo Welfare Foundation.
        </p>
        <button 
          style={{
            background: 'white',
            color: '#667eea',
            padding: '18px 45px',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
          }}
          onClick={() => window.location.hash = '#signup'}
        >
          Register Now
        </button>
      </div>

      {/* Footer Info */}
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '40px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div>
            <h4 style={{color: '#667eea', marginBottom: '15px', fontWeight: '700', fontSize: '1.2em'}}>Contact Us</h4>
            <p style={{margin: '5px 0', color: '#666'}}>Email: info@mbogowelfare.org</p>
            <p style={{margin: '5px 0', color: '#666'}}>Phone: +254 XXX XXX XXX</p>
          </div>
          <div>
            <h4 style={{color: '#667eea', marginBottom: '15px', fontWeight: '700', fontSize: '1.2em'}}>Quick Links</h4>
            <p style={{margin: '8px 0', color: '#667eea', cursor: 'pointer', fontWeight: '500'}} onClick={() => navigateTo('about')}>About Us</p>
            <p style={{margin: '8px 0', color: '#667eea', cursor: 'pointer', fontWeight: '500'}} onClick={() => navigateTo('faq')}>FAQ</p>
            <p style={{margin: '8px 0', color: '#667eea', cursor: 'pointer', fontWeight: '500'}} onClick={() => navigateTo('contact')}>Contact</p>
          </div>
          <div>
            <h4 style={{color: '#667eea', marginBottom: '15px', fontWeight: '700', fontSize: '1.2em'}}>Legal</h4>
            <p style={{margin: '8px 0', color: '#667eea', cursor: 'pointer', fontWeight: '500'}} onClick={() => navigateTo('terms')}>Terms & Conditions</p>
            <p style={{margin: '8px 0', color: '#667eea', cursor: 'pointer', fontWeight: '500'}} onClick={() => navigateTo('privacy')}>Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

