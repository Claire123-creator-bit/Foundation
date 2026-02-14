import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function MemberLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(credentials)
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          onLogin(data.member);
        } else {
          alert(data.error || 'Login failed');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,188,212,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,188,212,0.2)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white'
          }}>🔐</div>
          <h2 style={{
            color: '#333',
            margin: '0',
            fontSize: '1.8em',
            background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Member Login</h2>
          <p style={{color: '#666', margin: '10px 0 0', fontSize: '14px'}}>Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{position: 'relative', marginBottom: '20px'}}>
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={e => setCredentials({...credentials, email: e.target.value})}
              required
              style={{
                paddingLeft: '45px',
                background: 'rgba(0,188,212,0.05)',
                border: '2px solid rgba(0,188,212,0.2)',
                borderRadius: '12px'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#00bcd4',
              fontSize: '16px'
            }}>📧</span>
          </div>

          <div style={{position: 'relative', marginBottom: '25px'}}>
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              required
              style={{
                paddingLeft: '45px',
                background: 'rgba(0,188,212,0.05)',
                border: '2px solid rgba(0,188,212,0.2)',
                borderRadius: '12px'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#00bcd4',
              fontSize: '16px'
            }}>🔒</span>
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '12px',
            background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,188,212,0.3)'
          }}>Login</button>
        </form>
      </div>
    </div>
  );
}

export default MemberLogin;
