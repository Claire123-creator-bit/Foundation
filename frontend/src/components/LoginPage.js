import React, { useState } from 'react';

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

      const response = await fetch(`https://foundation-0x4i.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        onLogin(data.role, data.user_id, data.name || 'Admin');
        setMessage(`Welcome ${data.name || 'Admin'}!`);
      } else {
        setMessage(data.message || 'Login failed. Check your credentials.');
      }
    } catch (error) {
      setMessage('Connection error. Please check your internet.');
    }
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
      
      <h2 className="page-title">Login to Mbogo Welfare Empowerment Foundation</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          type="button"
          onClick={() => setLoginType('member')}
          style={{
            background: loginType === 'member' ? '#006064' : '#ccc',
            color: 'white',
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
          onClick={() => setLoginType('admin')}
          style={{
            background: loginType === 'admin' ? '#006064' : '#ccc',
            color: 'white',
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
              <label>Password (National ID):</label>
              <div style={{position: 'relative'}}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.national_id}
                  onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                  required
                  placeholder="Enter your National ID"
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
      
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,96,100,0.05)', borderRadius: '10px' }}>
        <p style={{ margin: '0', color: '#666' }}>
          Don't have an account?{' '}
          <span onClick={() => onNavigate('signup')} style={{
            color: '#006064',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;