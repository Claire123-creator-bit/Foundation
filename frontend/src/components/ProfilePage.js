import React, { useState, useEffect } from 'react';
import './MembersList.css';

function ProfilePage({ userId, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/member-profile?member_id=${userId}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setProfile(data);
        setEditForm({
          phone_number: data.phone_number || '',
          county: data.county || '',
          constituency: data.constituency || '',
          ward: data.ward || '',
          physical_location: data.physical_location || ''
        });
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      phone_number: profile.phone_number || '',
      county: profile.county || '',
      constituency: profile.constituency || '',
      ward: profile.ward || '',
      physical_location: profile.physical_location || ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>No Profile Found</h3>
          <p>Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.full_names ? profile.full_names.charAt(0).toUpperCase() : 'M'}
        </div>
        <div className="profile-title">
          <h2>{profile.full_names}</h2>
          <span className={`verification-badge ${profile.is_verified ? 'verified' : 'pending'}`}>
            {profile.is_verified ? '✓ Verified Member' : 'Pending Verification'}
          </span>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{profile.full_names || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>National ID</label>
              <p>{profile.national_id || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{profile.phone_number || 'N/A'}</p>
              )}
            </div>
            <div className="info-item">
              <label>Category/Role</label>
              <p className="category-tag">{profile.category || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Registration Date</label>
              <p>{formatDate(profile.registration_date)}</p>
            </div>
            <div className="info-item">
              <label>Member ID</label>
              <p>#{profile.id}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Location Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>County</label>
              {isEditing ? (
                <input
                  type="text"
                  name="county"
                  value={editForm.county}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{profile.county || 'N/A'}</p>
              )}
            </div>
            <div className="info-item">
              <label>Constituency</label>
              {isEditing ? (
                <input
                  type="text"
                  name="constituency"
                  value={editForm.constituency}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{profile.constituency || 'N/A'}</p>
              )}
            </div>
            <div className="info-item">
              <label>Ward</label>
              {isEditing ? (
                <input
                  type="text"
                  name="ward"
                  value={editForm.ward}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{profile.ward || 'N/A'}</p>
              )}
            </div>
            <div className="info-item full-width">
              <label>Physical Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="physical_location"
                  value={editForm.physical_location}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{profile.physical_location || 'N/A'}</p>
              )}
            </div>
            {profile.gps_latitude && profile.gps_longitude && (
              <div className="info-item">
                <label>GPS Coordinates</label>
                <p>{profile.gps_latitude}, {profile.gps_longitude}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={() => alert('Profile update functionality would be implemented here')}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
          border-radius: 12px;
          color: white;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          color: #00bcd4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
        }

        .profile-title {
          flex: 1;
          margin-left: 20px;
        }

        .profile-title h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
        }

        .verification-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .verification-badge.verified {
          background: rgba(255, 255, 255, 0.2);
        }

        .verification-badge.pending {
          background: rgba(255, 193, 7, 0.8);
          color: #333;
        }

        .logout-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .profile-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-section h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
          border-bottom: 2px solid #00bcd4;
          padding-bottom: 10px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .info-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-item.full-width {
          grid-column: span 2;
        }

        .info-item label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item p {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .category-tag {
          display: inline-block;
          padding: 4px 12px;
          background: #00bcd4;
          color: white;
          border-radius: 20px;
          font-size: 14px;
        }

        .edit-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #00bcd4;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
        }

        .edit-input:focus {
          border-color: #0097a7;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        .edit-btn, .save-btn {
          padding: 12px 30px;
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .cancel-btn {
          padding: 12px 30px;
          background: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #00bcd4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
        }

        .error-message h3 {
          margin-top: 0;
        }

        .retry-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: #c62828;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;

