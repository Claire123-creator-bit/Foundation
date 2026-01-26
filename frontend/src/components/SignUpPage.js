import React, { useState } from 'react';

const SignUpPage = ({ onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirm_password) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onSignUpSuccess(formData.phone_number);
      } else {
        setMessage(data.error || 'Sign up failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#006064', fontSize: '2.5em', marginBottom: '10px' }}>
          Mbogo Foundation
        </h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Empowering Communities Through Unity
        </p>
      </div>

      <h2 className="page-title">Create Your Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            placeholder="Create a password"
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
            required
            placeholder="Confirm your password"
            minLength="6"
          />
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
    </div>
  );
};

export default SignUpPage;