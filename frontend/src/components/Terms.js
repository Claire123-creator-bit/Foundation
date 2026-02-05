import React from 'react';

function Terms() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  return (
    <div className="form-container">
      <button onClick={goBack} style={{
        marginBottom: '20px',
        padding: '10px 20px',
        background: 'linear-gradient(45deg, #006064, #00838f)',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer'
      }}>
        ← Back to Home
      </button>
      <h2 className="page-title">Terms & Conditions</h2>
      
      <div className="terms-section">
        <h3 className="section-title">1. Acceptance of Terms</h3>
      <p>By using Mbogo Foundation services, you agree to these terms and conditions.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">2. Membership</h3>
      <p>Membership is open to all individuals who support our mission and values. Members must provide accurate information during registration.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">3. Code of Conduct</h3>
      <p>All members must conduct themselves respectfully and in accordance with our community guidelines.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">4. Privacy</h3>
      <p>We respect your privacy and handle personal data according to our Privacy Policy.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">5. Donations</h3>
      <p>All donations are voluntary and will be used for foundation activities and community programs.</p>
      
      </div>
      
      <div className="terms-section">
        <h3 className="section-title">6. Changes to Terms</h3>
      <p>We reserve the right to update these terms. Members will be notified of significant changes.</p>
      
      </div>
      
      <p style={{marginTop: '30px', fontStyle: 'italic', textAlign: 'center'}}>Last updated: January 2025</p>
    </div>
  );
}

export default Terms;