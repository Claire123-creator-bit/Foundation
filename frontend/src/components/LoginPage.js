import React, { useState } from 'react';

const LoginPage = ({ onLogin, onNavigate }) => {
  const [loginType, setLoginType] = useState('member');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    national_id: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Connecting to server... Please wait up to 50 seconds.');

    try {
      const endpoint = loginType === 'admin' ? '/admin-login' : '/member-login';
      const payload = loginType === 'admin' 
        ? { username: formData.username, password: formData.password }
        : { national_id: formData.national_id };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`https://foundation-0x4i.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.success) {
        onLogin(data.role, data.user_id, data.name || 'Admin');
        setMessage(`Welcome ${data.name || 'Admin'}!`);
      } else {
        setMessage(loginType === 'admin' ? 'Invalid admin credentials' : 'Member not found');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('Server timeout. Please try again.');
      } else {
        setMessage('Server is waking up. Please wait 30 seconds and try again.');
      }
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
          <div className="form-group">
            <label>National ID:</label>
            <input
              type="text"
              value={formData.national_id}
              onChange={(e) => setFormData({...formData, national_id: e.target.value})}
              required
              placeholder="Enter your National ID"
            />
          </div>
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