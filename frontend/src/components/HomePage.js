import React from 'react';

function HomePage() {
  const handleQuickLink = (action) => {
    switch(action) {
      case 'members':
        window.location.hash = '#members';
        break;
      case 'about':
        window.location.hash = '#about';
        break;
      case 'contact':
        window.location.hash = '#contact';
        break;
      case 'faq':
        window.location.hash = '#faq';
        break;
      default:
        alert(`${action} feature coming soon!`);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="form-container" style={{ scrollPaddingTop: '100px' }}>
      <div style={{textAlign: 'center', padding: '10px'}}>
        <h2 style={{
          color: '#333', 
          fontSize: '1.2em', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Mbogo Welfare Empowerment Foundation
        </h2>
        <p style={{fontSize: '0.9em', color: '#666', marginBottom: '15px'}}>
          Empowering communities through transparency and trust
        </p>
        
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(30,60,114,0.08) 0%, rgba(42,82,152,0.04) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(30,60,114,0.1)'
        }}>
          <h3 style={{
            color: '#1e3c72',
            marginBottom: '10px',
            textAlign: 'center',
            fontSize: '1em',
            fontWeight: 'bold'
          }}>Quick Links</h3>
          <div style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '8px'
          }}>
            {[
              {text: 'Browse Members', color: '#00bcd4', action: 'members'},
              {text: 'How It Works', color: '#0097a7', action: 'how-it-works'},
              {text: 'About Us', color: '#00acc1', action: 'about'},
              {text: 'Support', color: '#00838f', action: 'support'},
              {text: 'Contact Us', color: '#006064', action: 'contact'},
              {text: 'FAQ', color: '#004d40', action: 'faq'}
            ].map((item, index) => (
              <button key={index} onClick={() => handleQuickLink(item.action)} style={{
                padding: '18px 15px',
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px ${item.color}40`
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = `0 8px 25px ${item.color}60`;
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 4px 15px ${item.color}40`;
              }}>
                {item.text}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '10px', 
          marginTop: '15px'
        }}>
          <div style={{
            padding: '30px', 
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 188, 212, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-10px) scale(1.05)';
            e.target.style.boxShadow = '0 20px 50px rgba(0, 188, 212, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(0, 188, 212, 0.3)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }}></div>
            <h3 style={{color: 'white', marginBottom: '15px', fontSize: '1.4em'}}>Our Mission</h3>
            <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.6'}}>Building stronger communities through transparent governance and community engagement.</p>
          </div>
          
          <div style={{
            padding: '30px', 
            background: 'linear-gradient(135deg, #0097a7 0%, #00838f 100%)', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 151, 167, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-10px) scale(1.05)';
            e.target.style.boxShadow = '0 20px 50px rgba(0, 151, 167, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(0, 151, 167, 0.3)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }}></div>
            <h3 style={{color: 'white', marginBottom: '15px', fontSize: '1.4em'}}>Get Involved</h3>
            <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.6'}}>Join our programs, register as a member, and make a difference in your community.</p>
          </div>
          
          <div style={{
            padding: '30px', 
            background: 'linear-gradient(135deg, #00acc1 0%, #006064 100%)', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 172, 193, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-10px) scale(1.05)';
            e.target.style.boxShadow = '0 20px 50px rgba(0, 172, 193, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(0, 172, 193, 0.3)';
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }}></div>
            <h3 style={{color: 'white', marginBottom: '15px', fontSize: '1.4em'}}>Support Us</h3>
            <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.6'}}>Contribute to our cause through donations and volunteer work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;