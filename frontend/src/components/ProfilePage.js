import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function ProfilePage({ userId, onLogout }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemberProfile();
  }, [userId]);

  const fetchMemberProfile = () => {
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (!storedUserId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Role': userRole || 'member',
      'User-ID': storedUserId
    };

    fetch(`${API_BASE}/member-profile`, { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        return res.json();
      })
      .then(data => {
        console.log('Profile data:', data);
        setMember(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Profile fetch error:', err);
        setError('Unable to load profile. Please check your connection.');
        setLoading(false);
      });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchMemberProfile();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
        minHeight: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #0A2463',
          borderTop: '4px solid #0A2463',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#0A2463' }}>Loading profile...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #0A2463',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <h3 style={{ color: '#0A2463', margin: '0 0 15px 0' }}>Error</h3>
          <p style={{ color: '#0A2463', margin: '0 0 20px 0' }}>{error}</p>
          <button onClick={handleRetry} style={{
            background: '#0A2463',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div style={{
        background: '#0A2463',
        color: '#FFFFFF',
        padding: 'clamp(15px, 4vw, 30px)',
        borderRadius: '15px',
        marginBottom: 'clamp(15px, 4vw, 30px)',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.3em, 4vw, 2em)', color: '#FFFFFF' }}>My Profile</h2>
        <p style={{ margin: '0', fontSize: 'clamp(12px, 3vw, 14px)', color: '#FFFFFF' }}>View and manage your account information</p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: 'clamp(15px, 4vw, 30px)',
        border: '1px solid #0A2463',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: 'clamp(15px, 4vw, 30px)' }}>
          <h3 style={{ color: '#0A2463', marginBottom: '20px', borderBottom: '2px solid #0A2463', paddingBottom: '10px', fontSize: 'clamp(16px, 3.5vw, 18px)' }}>
            Personal Information
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Full Name
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463', wordBreak: 'break-word' }}>{member.full_names}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                National Id
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463' }}>{member.national_id}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Phone Number
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463' }}>{member.phone_number}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Category
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463' }}>{member.category}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 'clamp(15px, 4vw, 30px)' }}>
          <h3 style={{ color: '#0A2463', marginBottom: '20px', borderBottom: '2px solid #0A2463', paddingBottom: '10px', fontSize: 'clamp(16px, 3.5vw, 18px)' }}>
            Location Details
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                County
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463', wordBreak: 'break-word' }}>{member.county}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Constituency
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463', wordBreak: 'break-word' }}>{member.constituency}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Ward
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463', wordBreak: 'break-word' }}>{member.ward}</p>
            </div>

            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Physical Location
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463', wordBreak: 'break-word' }}>{member.physical_location}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 'clamp(15px, 4vw, 30px)' }}>
          <h3 style={{ color: '#0A2463', marginBottom: '20px', borderBottom: '2px solid #0A2463', paddingBottom: '10px', fontSize: 'clamp(16px, 3.5vw, 18px)' }}>
            Account Status
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div className="profile-field">
              <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Verification Status
              </label>
              <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                <span style={{
                  background: '#0A2463',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  {member.is_verified ? 'Verified' : 'Pending Verification'}
                </span>
              </p>
            </div>

            {member.last_login && (
              <div className="profile-field">
                <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  Last Login
                </label>
                <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463' }}>
                  {new Date(member.last_login).toLocaleString()}
                </p>
              </div>
            )}

            {member.registration_date && (
              <div className="profile-field">
                <label style={{ fontWeight: 'bold', color: '#0A2463', display: 'block', marginBottom: '5px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  Member Since
                </label>
                <p style={{ margin: '0', fontSize: 'clamp(14px, 3vw, 16px)', color: '#0A2463' }}>
                  {new Date(member.registration_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #0A2463' }}>
          <p style={{ color: '#0A2463', fontSize: 'clamp(12px, 2.5vw, 14px)', marginBottom: '15px' }}>
            Need to update your information? Please contact an administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

