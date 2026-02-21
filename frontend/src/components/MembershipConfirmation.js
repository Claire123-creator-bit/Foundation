import React, { useState } from 'react';

const MembershipConfirmation = ({ memberData, onContinue }) => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  const WelcomePopup = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#FFFFFF',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '500px',
        textAlign: 'center',
        border: '3px solid #0A2463'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#0A2463',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: '#FFFFFF'
        }}>
          ✓
        </div>
        
        <h2 style={{ color: '#0A2463', marginBottom: '20px' }}>
          Welcome to Mbogo Welfare Empowerment Foundation!
        </h2>
        
        <p style={{ fontSize: '18px', color: '#0A2463', marginBottom: '15px' }}>
          Dear <strong>{memberData.full_names}</strong>,
        </p>
        
        <p style={{ fontSize: '16px', color: '#0A2463', lineHeight: '1.6', marginBottom: '25px' }}>
          You are now a registered member of our foundation. 
          Thank you for joining us in our mission to empower communities through unity and development.
        </p>
        
        <div style={{
          background: '#FFFFFF',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '25px',
          border: '2px solid #0A2463'
        }}>
          <p style={{ margin: '0', color: '#0A2463', fontWeight: 'bold' }}>
            SMS Confirmation Sent
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#0A2463' }}>
            A confirmation message has been sent to {memberData.phone_number}
          </p>
        </div>
        
        <button 
          onClick={() => {
            setShowWelcomePopup(false);
            onContinue();
          }}
          style={{
            background: '#0A2463',
            color: '#FFFFFF',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: '#0A2463',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          color: '#FFFFFF'
        }}>
          ✓
        </div>
        
        <h1 style={{ color: '#0A2463', fontSize: '2.2em', marginBottom: '10px' }}>
          Registration Successful
        </h1>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ color: '#0A2463', marginBottom: '20px' }}>
          Membership Confirmation
        </h3>
        
        <div style={{ fontSize: '18px', marginBottom: '15px' }}>
          <strong>{memberData.full_names}</strong>
        </div>
        
        <div style={{
          background: '#0A2463',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '20px',
          display: 'inline-block',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Status: REGISTERED MEMBER
        </div>
        
        <div style={{ color: '#0A2463', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>National Id:</strong> {memberData.national_id}</p>
          <p><strong>Phone:</strong> {memberData.phone_number}</p>
          <p><strong>Location:</strong> {memberData.ward} Ward, {memberData.constituency}, {memberData.county}</p>
          <p><strong>Category:</strong> {memberData.category}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#0A2463', fontSize: '16px', fontWeight: 'bold' }}>
          You are now officially a member of Mbogo Welfare Empowerment Foundation
        </p>
      </div>

      {showWelcomePopup && <WelcomePopup />}
    </div>
  );
};

export default MembershipConfirmation;

