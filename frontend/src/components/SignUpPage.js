import React, { useState } from 'react';

const SignUpPage = ({ onSignUpSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    confirm_id: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showId, setShowId] = useState(false);
  const [showConfirmId, setShowConfirmId] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.national_id !== formData.confirm_id) {
      setMessage('ID numbers do not match');
      setLoading(false);
      return;
    }

    onSignUpSuccess(formData.full_name, formData.national_id);
    setLoading(false);
  };

  return (
    <div className="form-container">
      <button type="button" onClick={() => onNavigate('landing')} style={{
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
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#006064', fontSize: '2.5em', marginBottom: '10px' }}>
          Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Empowering Communities Through Unity
        </p>
      </div>

      <h2 className="page-title">Create Your Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>National ID Number:</label>
          <div style={{position: 'relative'}}>
            <input
              type={showId ? "text" : "password"}
              value={formData.national_id}
              onChange={(e) => setFormData({...formData, national_id: e.target.value})}
              required
              placeholder="Enter your National ID"
            />
            <button
              type="button"
              onClick={() => setShowId(!showId)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '5px',
                color: '#1e3c72',
                fontWeight: '600'
              }}
            >
              {showId ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm National ID:</label>
          <div style={{position: 'relative'}}>
            <input
              type={showConfirmId ? "text" : "password"}
              value={formData.confirm_id}
              onChange={(e) => setFormData({...formData, confirm_id: e.target.value})}
              required
              placeholder="Confirm your National ID"
            />
            <button
              type="button"
              onClick={() => setShowConfirmId(!showConfirmId)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '5px',
                color: '#1e3c72',
                fontWeight: '600'
              }}
            >
              {showConfirmId ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,96,100,0.05)', borderRadius: '10px' }}>
        <p style={{ margin: '0', color: '#666' }}>
          Already have an account?{' '}
          <span onClick={() => onNavigate('login')} style={{
            color: '#006064',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;