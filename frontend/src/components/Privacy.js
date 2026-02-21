import React from 'react';

function Privacy() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  return (
    <div className="form-container">
      <button onClick={goBack} style={{
        marginBottom: '20px',
        padding: '10px 20px',
        background: '#0A2463',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer'
      }}>
        ← Back to Home
      </button>
      <h2 className="page-title">Privacy Policy</h2>
      
      <div className="terms-section">
        <h3 className="section-title">Information We Collect</h3>
      <p style={{color: '#0A2463'}}>We collect personal information including name, ID number, phone number, polling centre, and organization details when you register as a member.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">How We Use Your Information</h3>
      <ul style={{color: '#0A2463'}}>
        <li>To manage your membership</li>
        <li>To send important updates and communications</li>
        <li>To organize community programs and events</li>
        <li>To maintain accurate records for transparency</li>
      </ul>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">Data Security</h3>
      <p style={{color: '#0A2463'}}>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">Information Sharing</h3>
      <p style={{color: '#0A2463'}}>We do not sell, trade, or share your personal information with third parties without your consent, except as required by law.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">Your Rights</h3>
      <p style={{color: '#0A2463'}}>You have the right to access, update, or delete your personal information. Contact us to exercise these rights.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">Contact Us</h3>
      <p style={{color: '#0A2463'}}>If you have questions about this Privacy Policy, please contact us through our Contact Us page.</p>
      
      </div>
      
      <p style={{marginTop: '30px', fontStyle: 'italic', textAlign: 'center', color: '#0A2463'}}>Last updated: January 2025</p>
    </div>
  );
}

export default Privacy;

