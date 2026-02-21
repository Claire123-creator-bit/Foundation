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

  return (
    <div className="form-container">
      <h2 className="page-title">Mbogo Welfare Empowerment Foundation</h2>
      <p style={{textAlign: 'center', marginBottom: '32px'}}>Empowering communities through transparency and trust</p>
      
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 200px))', 
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        {[
          {text: 'Browse Members', action: 'members'},
          {text: 'About Us', action: 'about'},
          {text: 'Contact Us', action: 'contact'},
          {text: 'FAQ', action: 'faq'}
        ].map((item, index) => (
          <button key={index} onClick={() => handleQuickLink(item.action)} style={{
            width: '200px',
            height: '200px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            {item.text}
          </button>
        ))}
      </div>
      
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 300px))', 
        gap: '16px',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '300px',
          height: '300px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <h3>Our Mission</h3>
          <p>Building stronger communities through transparent governance and community engagement.</p>
        </div>
        
        <div style={{
          width: '300px',
          height: '300px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <h3>Get Involved</h3>
          <p>Join our programs, register as a member, and make a difference in your community.</p>
        </div>
        
        <div style={{
          width: '300px',
          height: '300px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <h3>Support Us</h3>
          <p>Contribute to our cause through donations and volunteer work.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
