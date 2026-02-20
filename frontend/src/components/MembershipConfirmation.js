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
        background: 'white',
        padding: '40px',
        borderRadius: '20px 18px 22px 16px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '3px 8px 25px rgba(135,206,235, 0.2)',
        border: '3px solid #87CEEB'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #87CEEB, #87CEEB)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: 'white'
        }}>
          ✓
        </div>
        
        <h2 style={{ color: '#87CEEB', marginBottom: '20px' }}>
          Welcome to Mbogo Welfare Empowerment Foundation!
        </h2>
        
        <p style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>
          Dear <strong>{memberData.full_names}</strong>,
        </p>
        
        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>
          You are now a registered member of our foundation. 
          Thank you for joining us in our mission to empower communities through unity and development.
        </p>
        
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '25px',
          border: '2px solid #87CEEB'
        }}>
          <p style={{ margin: '0', color: '#87CEEB', fontWeight: 'bold' }}>
            📱 SMS Confirmation Sent
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            A confirmation message has been sent to {memberData.phone_number}
          </p>
        </div>
        
        <button 
          onClick={() => {
            setShowWelcomePopup(false);
            onContinue();
          }}
          style={{
            background: 'linear-gradient(135deg, #87CEEB, #87CEEB)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(135,206,235, 0.3)'
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
          background: 'linear-gradient(135deg, #87CEEB, #87CEEB)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          color: 'white'
        }}>
          ✓
        </div>
        
        <h1 style={{ color: '#87CEEB', fontSize: '2.2em', marginBottom: '10px' }}>
          Registration Successful
        </h1>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ color: '#87CEEB', marginBottom: '20px' }}>
          Membership Confirmation
        </h3>
        
        <div style={{ fontSize: '18px', marginBottom: '15px' }}>
          <strong>{memberData.full_names}</strong>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #87CEEB, #87CEEB)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          display: 'inline-block',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Status: REGISTERED MEMBER
        </div>
        
        <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>National Id:</strong> {memberData.national_id}</p>
          <p><strong>Phone:</strong> {memberData.phone_number}</p>
          <p><strong>Location:</strong> {memberData.ward} Ward, {memberData.constituency}, {memberData.county}</p>
          <p><strong>Category:</strong> {memberData.category}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#87CEEB', fontSize: '16px', fontWeight: 'bold' }}>
          🎉 You are now officially a member of Mbogo Welfare Empowerment Foundation
        </p>
      </div>

      {showWelcomePopup && <WelcomePopup />}
    </div>
  );
};

export default MembershipConfirmation;

