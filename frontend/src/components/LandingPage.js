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
      <div style={{textAlign: 'center', padding: '20px'}}>
        <h1 style={{
          fontSize: '3em',
          background: 'linear-gradient(45deg, #006064, #00838f)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px'
        }}>
          Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{fontSize: '1.3em', color: '#666', marginBottom: '30px'}}>
          Empowering communities through transparency and trust
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {[
            {label: 'About Us', page: 'about'},
            {label: 'Contact Us', page: 'contact'},
            {label: 'FAQ', page: 'faq'},
            {label: 'Terms & Conditions', page: 'terms'},
            {label: 'Privacy Policy', page: 'privacy'}
          ].map(item => (
            <button key={item.page} onClick={() => handleNavigation(item.page)} style={{
              padding: '12px 24px',
              background: 'rgba(0, 96, 100, 0.1)',
              color: '#006064',
              border: '2px solid rgba(0, 96, 100, 0.3)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {[
            {label: 'Features', id: 'features'},
            {label: 'Mission', id: 'about'},
            {label: 'Benefits', id: 'benefits'}
          ].map(item => (
            <button key={item.id} onClick={() => scrollToSection(item.id)} style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#00838f',
              border: '1px solid rgba(0, 131, 143, 0.3)',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              {item.label}
            </button>
          ))}
        </div>

        <div id="features" style={{
          padding: '40px 20px',
          background: 'linear-gradient(135deg, rgba(0,188,212,0.05) 0%, rgba(0,151,167,0.02) 100%)',
          borderRadius: '20px',
          marginBottom: '40px'
        }}>
          <h2 style={{color: '#006064', marginBottom: '30px', fontSize: '2em'}}>Platform Features</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {[
              {title: 'Member Registration', desc: 'Easy registration with location tracking'},
              {title: 'Meeting Management', desc: 'Schedule and track meetings & attendance'},
              {title: 'Bulk Messaging', desc: 'Send SMS to members by category'},
              {title: 'Data Capture', desc: 'Collect and manage member data'},
              {title: 'Database Viewer', desc: 'View and manage all records'},
              {title: 'Admin Dashboard', desc: 'Complete administrative control'}
            ].map((feature, idx) => (
              <div key={idx} style={{
                padding: '20px',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #00bcd4',
                textAlign: 'left',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h4 style={{color: '#006064', marginBottom: '10px', fontSize: '1.1em'}}>{feature.title}</h4>
                <p style={{color: '#666', fontSize: '0.9em', margin: 0}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="about" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 188, 212, 0.3)',
            color: 'white',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{fontSize: '1.5em', marginBottom: '15px'}}>Our Mission</h3>
            <p style={{lineHeight: '1.6', opacity: '0.95'}}>
              Building stronger communities through transparent governance and community engagement.
            </p>
          </div>

          <div style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #0097a7 0%, #00838f 100%)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 151, 167, 0.3)',
            color: 'white',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{fontSize: '1.5em', marginBottom: '15px'}}>Get Involved</h3>
            <p style={{lineHeight: '1.6', opacity: '0.95'}}>
              Join our programs, register as a member, and make a difference in your community.
            </p>
          </div>

          <div style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #00acc1 0%, #006064 100%)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 172, 193, 0.3)',
            color: 'white',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{fontSize: '1.5em', marginBottom: '15px'}}>Support Us</h3>
            <p style={{lineHeight: '1.6', opacity: '0.95'}}>
              Contribute to our cause through donations and volunteer work.
            </p>
          </div>
        </div>

        <div id="benefits" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(0,151,167,0.05) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(0,188,212,0.2)',
          marginBottom: '30px'
        }}>
          <h2 style={{color: '#006064', marginBottom: '20px'}}>Why Join Us?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'left'
          }}>
            {[
              '✓ Community Support',
              '✓ Transparent Governance',
              '✓ Member Benefits',
              '✓ Regular Updates',
              '✓ Networking Opportunities',
              '✓ Empowerment Programs'
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: '15px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '1.1em',
                color: '#333'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <button onClick={onGetStarted} style={{
            padding: '18px 40px',
            fontSize: '1.2em',
            background: 'linear-gradient(45deg, #006064, #00838f)',
            borderRadius: '25px'
          }}>
            Get Started
          </button>
          <button onClick={onLogin} style={{
            padding: '18px 40px',
            fontSize: '1.2em',
            background: 'linear-gradient(45deg, #0097a7, #00acc1)',
            borderRadius: '25px'
          }}>
            Member Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
