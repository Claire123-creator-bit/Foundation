import React from 'react';

function Terms() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  return (
    <div className="form-container">
      <button onClick={goBack} style={{
        marginBottom: '30px',
        padding: '12px 30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600'
      }}>
        Back to Home
      </button>
      
      <h2 className="page-title">Terms & Conditions</h2>
      
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '25px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700'}}>Terms of Service</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: 'rgba(255,255,255,0.95)'}}>
          Please read these terms carefully before using our services
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #667eea'
      }}>
        <h3 style={{color: '#667eea', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>1. Acceptance of Terms</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          By accessing and using Mbogo Welfare Empowerment Foundation services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use our services.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #764ba2'
      }}>
        <h3 style={{color: '#764ba2', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>2. Membership</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          Membership is open to all individuals who support our mission and values. Members must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #f093fb'
      }}>
        <h3 style={{color: '#f093fb', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>3. Code of Conduct</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          All members must conduct themselves respectfully and in accordance with our community guidelines. We expect members to engage constructively, respect diverse opinions, and contribute positively to our community. Harassment, discrimination, or any form of abusive behavior will not be tolerated.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #667eea'
      }}>
        <h3 style={{color: '#667eea', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>4. Privacy & Data Protection</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          We respect your privacy and are committed to protecting your personal data. All information collected is handled in accordance with our Privacy Policy and applicable data protection laws. We implement appropriate security measures to safeguard your information.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #764ba2'
      }}>
        <h3 style={{color: '#764ba2', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>5. Contributions & Donations</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          All donations and contributions are voluntary and will be used exclusively for foundation activities and community programs. We maintain full transparency in how funds are utilized and provide regular updates to our members.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #f093fb'
      }}>
        <h3 style={{color: '#f093fb', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>6. Intellectual Property</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          All content, logos, and materials on this platform are the property of Mbogo Welfare Empowerment Foundation. You may not reproduce, distribute, or use any content without our express written permission.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '35px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        marginBottom: '25px',
        borderLeft: '6px solid #667eea'
      }}>
        <h3 style={{color: '#667eea', fontSize: '1.5em', marginBottom: '15px', fontWeight: '700'}}>7. Changes to Terms</h3>
        <p style={{color: '#4a5568', lineHeight: '1.8'}}>
          We reserve the right to update or modify these terms at any time. Members will be notified of significant changes via email or platform notifications. Continued use of our services after changes constitutes acceptance of the updated terms.
        </p>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '25px',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{margin: '0', fontSize: '15px', fontWeight: '600'}}>Last Updated: January 2025</p>
        <p style={{margin: '10px 0 0 0', fontSize: '14px', opacity: '0.9'}}>
          For questions about these terms, please contact us at legal@mbogofoundation.org
        </p>
      </div>
    </div>
  );
}

export default Terms;
