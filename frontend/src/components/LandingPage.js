import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function LandingPage({ onGetStarted, onLogin }) {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    confirm_id: '',
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showId, setShowId] = useState(false);
  const [showConfirmId, setShowConfirmId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigateTo = (page) => {
    window.location.hash = page;
    setTimeout(() => { window.location.reload(); }, 100);
  };

  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.national_id !== formData.confirm_id) {
      setMessage('ID numbers do not match');
      setLoading(false);
      return;
    }

    localStorage.setItem('signupName', formData.full_name);
    localStorage.setItem('signupId', formData.national_id);
    window.location.hash = '#registration';
    setLoading(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Logging in...');

    try {
      const response = await fetch(`${API_BASE}/member-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: formData.full_name, national_id: formData.national_id })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name);
        if (data.phone_number) localStorage.setItem('userPhone', data.phone_number);
        window.location.hash = '#dashboard';
        window.location.reload();
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Connection error');
    }
    setLoading(false);
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Logging in...');

    try {
      const response = await fetch(`${API_BASE}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name);
        window.location.hash = '#dashboard';
        window.location.reload();
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Connection error');
    }
    setLoading(false);
  };

  return (
    <div className="form-container" style={{ scrollPaddingTop: '100px' }}>
      <div style={{textAlign: 'center', padding: '10px'}}>
        
        {/* Logo and Title */}
        <div style={{marginBottom: '20px'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', boxShadow: '0 4px 15px rgba(30,60,114,0.3)'}}>
            <span style={{color: 'white', fontSize: '36px', fontWeight: 'bold'}}>M</span>
          </div>
          <h1 style={{fontSize: '1.4em', background: 'linear-gradient(45deg, #1e3c72, #2a5298)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '5px'}}>Mbogo Welfare Empowerment Foundation</h1>
          <p style={{fontSize: '1.1em', color: '#666', marginBottom: '0'}}>Empowering communities through transparency and trust</p>
        </div>

        {/* Tab Navigation */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
          <button onClick={() => { setActiveTab('register'); setMessage(''); }} style={{padding: '12px 25px', background: activeTab === 'register' ? 'linear-gradient(45deg, #006064, #00838f)' : '#ccc', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'}}>Register as Member</button>
          <button onClick={() => { setActiveTab('login'); setMessage(''); }} style={{padding: '12px 25px', background: activeTab === 'login' ? 'linear-gradient(45deg, #006064, #00838f)' : '#ccc', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'}}>Member Login</button>
          <button onClick={() => { setActiveTab('admin'); setMessage(''); }} style={{padding: '12px 25px', background: activeTab === 'admin' ? 'linear-gradient(45deg, #ff9800, #f57c00)' : '#ccc', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'}}>Admin Login</button>
        </div>

        {/* Registration Form */}
        {activeTab === 'register' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#006064', marginBottom: '20px', textAlign: 'center'}}>Register as a Member</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>National ID Number:</label>
                <div style={{position: 'relative'}}>
                  <input type={showId ? "text" : "password"} value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} required placeholder="Enter your National ID" />
                  <button type="button" onClick={() => setShowId(!showId)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '5px', color: '#1e3c72', fontWeight: '600'}}>{showId ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm National ID:</label>
                <div style={{position: 'relative'}}>
                  <input type={showConfirmId ? "text" : "password"} value={formData.confirm_id} onChange={(e) => setFormData({...formData, confirm_id: e.target.value})} required placeholder="Confirm your National ID" />
                  <button type="button" onClick={() => setShowConfirmId(!showConfirmId)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '5px', color: '#1e3c72', fontWeight: '600'}}>{showConfirmId ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{width: '100%', padding: '15px', background: 'linear-gradient(45deg, #006064, #00838f)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}>{loading ? 'Processing...' : 'Register'}</button>
            </form>
            {message && <div style={{marginTop: '15px', padding: '10px', borderRadius: '5px', background: '#ffebee', color: '#c62828'}}>{message}</div>}
          </div>
        )}

        {/* Member Login Form */}
        {activeTab === 'login' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#006064', marginBottom: '20px', textAlign: 'center'}}>Member Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Full Name (as registered):</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required placeholder="Enter your full name exactly as registered" />
              </div>
              <div className="form-group">
                <label>National ID:</label>
                <div style={{position: 'relative'}}>
                  <input type={showPassword ? "text" : "password"} value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} required placeholder="Enter your National ID" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px'}}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{width: '100%', padding: '15px', background: 'linear-gradient(45deg, #006064, #00838f)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
            {message && <div style={{marginTop: '15px', padding: '10px', borderRadius: '5px', background: '#ffebee', color: '#c62828'}}>{message}</div>}
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === 'admin' && (
          <div style={{maxWidth: '450px', margin: '0 auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
            <h2 style={{color: '#ff9800', marginBottom: '20px', textAlign: 'center'}}>Admin Login</h2>
            <form onSubmit={handleAdminLoginSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required placeholder="Enter admin username" />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <div style={{position: 'relative'}}>
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="Enter admin password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px'}}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{width: '100%', padding: '15px', background: 'linear-gradient(45deg, #ff9800, #f57c00)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}>{loading ? 'Logging in...' : 'Admin Login'}</button>
            </form>
            {message && <div style={{marginTop: '15px', padding: '10px', borderRadius: '5px', background: '#ffebee', color: '#c62828'}}>{message}</div>}
            <div style={{textAlign: 'center', marginTop: '15px', padding: '15px', background: 'rgba(255,152,0,0.1)', borderRadius: '10px'}}>
              <p style={{margin: '0', color: '#e65100', fontSize: '13px'}}>New administrator? <span onClick={() => navigateTo('admin-signup')} style={{color: '#006064', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}}>Register here</span></p>
            </div>
          </div>
        )}

        {/* Info Links */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px'}}>
          {[
            {label: 'About Us', page: 'about'},
            {label: 'Contact Us', page: 'contact'},
            {label: 'FAQ', page: 'faq'},
            {label: 'Terms & Conditions', page: 'terms'},
            {label: 'Privacy Policy', page: 'privacy'}
          ].map(item => (
            <button key={item.page} onClick={() => handleNavigation(item.page)} style={{padding: '8px 16px', background: 'rgba(0, 96, 100, 0.1)', color: '#006064', border: '1px solid rgba(0, 96, 100, 0.3)', borderRadius: '15px', cursor: 'pointer', fontSize: '12px'}}>{item.label}</button>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" style={{padding: '30px 20px', background: 'linear-gradient(135deg, rgba(0,188,212,0.05) 0%, rgba(0,151,167,0.02) 100%)', borderRadius: '20px', marginBottom: '30px'}}>
          <h2 style={{color: '#006064', marginBottom: '20px', fontSize: '1.5em'}}>Platform Features</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px'}}>
            {[
              {title: 'Member Registration', desc: 'Easy registration'},
              {title: 'Meeting Management', desc: 'Track meetings'},
              {title: 'Bulk Messaging', desc: 'Send SMS'},
              {title: 'Data Capture', desc: 'Manage data'},
              {title: 'Database Viewer', desc: 'View records'},
              {title: 'Admin Dashboard', desc: 'Full control'}
            ].map((feature, idx) => (
              <div key={idx} style={{padding: '15px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '3px solid #00bcd4', textAlign: 'left'}}>
                <h4 style={{color: '#006064', marginBottom: '5px', fontSize: '0.95em'}}>{feature.title}</h4>
                <p style={{color: '#666', fontSize: '0.8em', margin: 0}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mission Section */}
        <div id="about" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px'}}>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Our Mission</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Building stronger communities through transparent governance.</p>
          </div>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #0097a7 0%, #00838f 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Get Involved</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Join our programs and make a difference.</p>
          </div>
          <div style={{padding: '20px', background: 'linear-gradient(135deg, #00acc1 0%, #006064 100%)', borderRadius: '15px', color: 'white'}}>
            <h3 style={{fontSize: '1.2em', marginBottom: '10px'}}>Support Us</h3>
            <p style={{lineHeight: '1.5', opacity: '0.95', fontSize: '0.9em'}}>Contribute through donations and volunteering.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" style={{padding: '30px', background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(0,151,167,0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(0,188,212,0.2)', marginBottom: '20px'}}>
          <h2 style={{color: '#006064', marginBottom: '15px'}}>Why Join Us?</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', textAlign: 'left'}}>
            {['✓ Community Support', '✓ Transparent Governance', '✓ Member Benefits', '✓ Regular Updates', '✓ Networking', '✓ Empowerment'].map((item, idx) => (
              <div key={idx} style={{padding: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: '0.9em', color: '#333'}}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
