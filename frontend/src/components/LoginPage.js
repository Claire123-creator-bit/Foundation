import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

const LoginPage = ({ onLogin, onNavigate }) => {
  const [loginType, setLoginType] = useState('member');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    national_id: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Logging in...');

    try {
      const endpoint = loginType === 'admin' ? '/admin-login' : '/member-login';
      const payload = loginType === 'admin' 
        ? { username: formData.username, password: formData.password }
        : { full_name: formData.full_name, national_id: formData.national_id };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Get phone number from the response if available
        const phoneNumber = data.phone_number || '';
        onLogin(data.role, data.user_id, data.name || 'Admin', phoneNumber);
        setMessage(`Welcome ${data.name || 'Admin'}!`);
      } else {
        // Provide more helpful error messages
        let errorMsg = data.message || 'Login failed. Check your credentials.';
        
        if (loginType === 'member') {
          if (errorMsg.includes('Invalid credentials')) {
            errorMsg = 'Invalid name or National ID. Please check your registration details.';
          }
        } else {
          if (errorMsg.includes('Invalid username')) {
            errorMsg = 'Invalid admin username or password.';
          }
        }
        
        setMessage(errorMsg);
      }
    } catch (error) {
      setMessage('Connection error. Please check your internet and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <button type="button" onClick={() => onNavigate('landing')} style={{
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
      
      <h2 className="page-title">Login to Mbogo Welfare Empowerment Foundation</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          type="button"
          onClick={() => { setLoginType('member'); setMessage(''); }}
          style={{
            background: loginType === 'member' ? '#0A2463' : '#CCCCCC',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            margin: '0 10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Member Login
        </button>
        <button 
          type="button"
          onClick={() => { setLoginType('admin'); setMessage(''); }}
          style={{
            background: loginType === 'admin' ? '#0A2463' : '#CCCCCC',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            margin: '0 10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Admin Login
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {loginType === 'admin' ? (
          <>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                placeholder="Enter admin username"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                placeholder="Enter admin password"
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Full Name (as registered):</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                placeholder="Enter your full name exactly as registered"
              />
            </div>
            <div className="form-group">
              <label>National Id:</label>
              <div style={{position: 'relative'}}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.national_id}
                  onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                  required
                  placeholder="Enter your National Id"
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
                    fontSize: '18px',
                    padding: '5px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {message && (
        <div className={`alert ${message.includes('Welcome') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #0A2463' }}>
        <p style={{ margin: '0', color: '#0A2463' }}>
          Don't have an account?{' '}
          <span onClick={() => onNavigate('signup')} style={{
            color: '#0A2463',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Sign up here
          </span>
        </p>
        {loginType === 'member' && (
          <p style={{ margin: '10px 0 0 0', color: '#0A2463', fontSize: '12px' }}>
            Forgot your National Id? Please contact support or re-register.
          </p>
        )}
      </div>
      
      {/* Admin Sign Up Link */}
      {loginType === 'admin' && (
        <div style={{ textAlign: 'center', marginTop: '15px', padding: '15px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #0A2463' }}>
          <p style={{ margin: '0', color: '#0A2463', fontSize: '13px' }}>
            New administrator?{' '}
            <span onClick={() => onNavigate('admin-signup')} style={{
              color: '#0A2463',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Register here
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

