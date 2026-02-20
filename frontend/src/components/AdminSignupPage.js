import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function AdminSignupPage({ onNavigate, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters!');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Admin account created successfully! Please login.');
        setMessageType('success');
        // Clear form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          email: '',
          phone: ''
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Connection error. Please check your internet and try again.');
      setMessageType('error');
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <button type="button" onClick={() => onNavigate('landing')} style={{
        marginBottom: '20px',
        padding: '10px 20px',
        background: 'linear-gradient(45deg, #87CEEB, #87CEEB)',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer'
      }}>
        ← Back to Home
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#87CEEB', fontSize: '2.5em', marginBottom: '10px' }}>
          Mbogo Welfare Empowerment Foundation
        </h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Empowering Communities Through Unity
        </p>
      </div>

      <h2 className="page-title" style={{ textAlign: 'center' }}>Admin Registration</h2>

      <div style={{
        background: 'rgba(135,206,235,0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '1px solid rgba(135,206,235,0.3)'
      }}>
        <p style={{ margin: 0, color: '#87CEEB', fontSize: '14px' }}>
          <strong>Note:</strong> This registration is for administrators only. 
          You will need approval from the main administrator to access admin features.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+254XXXXXXXXX"
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (min 6 characters)"
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
                color: '#87CEEB',
                fontWeight: '600'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
        </div>

        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%',
          padding: '15px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: loading ? '#ccc' : 'linear-gradient(45deg, #87CEEB, #87CEEB)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '10px'
        }}>
          {loading ? 'Creating Account...' : 'Register as Admin'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(135,206,235,0.05)', borderRadius: '10px' }}>
        <p style={{ margin: '0', color: '#666' }}>
          Already have an admin account?{' '}
          <span onClick={() => onNavigate('login')} style={{
            color: '#87CEEB',
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
}

export default AdminSignupPage;

