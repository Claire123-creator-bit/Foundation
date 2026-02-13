import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function EnhancedRegistrationPro({ signupPhone, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    full_names: '',
    national_id: '',
    phone_number: signupPhone || '',
    county: '',
    constituency: '',
    ward: '',
    physical_location: '',
    gps_latitude: '',
    gps_longitude: '',
    category: ''
  });

  const [locationStatus, setLocationStatus] = useState('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const categories = [
    'Church Leader', 'Pastor', 'Village Elder', 'Agent', 
    'Youth Leader', 'Women Leader', 'Community Member', 
    'Government Official', 'NGO Representative', 'Volunteer'
  ];

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
    'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi',
    'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
    'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
    'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
    'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
    'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
  ];

  const captureGPSLocation = () => {
    setIsCapturingLocation(true);
    setLocationStatus('Capturing your location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({
            ...formData,
            gps_latitude: latitude.toString(),
            gps_longitude: longitude.toString()
          });
          setLocationStatus(`Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsCapturingLocation(false);
        },
        (error) => {
          setLocationStatus('Location access denied. Please enter manually.');
          setIsCapturingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationStatus('GPS not supported. Please enter location manually.');
      setIsCapturingLocation(false);
    }
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails('');
    setSuccessMessage('');
    
    if (!formData.national_id || formData.national_id.length < 7) {
      setErrorMessage('Please enter a valid National ID number');
      return;
    }
    
    if (!formData.phone_number || formData.phone_number.length < 10) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting registration data:', formData);

    fetch(`${API_BASE}/register-member-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        console.log('Response status:', res.status);
        console.log('Response headers:', [...res.headers.entries()]);
        
        return res.text().then(text => {
          console.log('Raw response:', text);
          try {
            const data = JSON.parse(text);
            console.log('Parsed response:', data);
            if (!res.ok) {
              setErrorDetails(data.details || `Status: ${res.status}`);
              throw new Error(data.error || `Server error (${res.status})`);
            }
            return data;
          } catch (e) {
            setErrorDetails(`Parse error: ${e.message}. Raw response: ${text.substring(0, 200)}`);
            throw new Error(`Invalid server response (${res.status})`);
          }
        });
      })
      .then(data => {
        setIsSubmitting(false);
        if (data.member_data) {
          setSuccessMessage('Registration successful! Redirecting...');
          onRegistrationSuccess(data);
        } else if (data.message && data.user_id) {
          setSuccessMessage('Registration successful! Redirecting...');
          onRegistrationSuccess(data);
        } else {
          setErrorMessage('Registration completed but unexpected response from server.');
          setErrorDetails(JSON.stringify(data, null, 2));
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        console.error('Registration error:', err);
        setErrorMessage(err.message || 'Registration failed. Please try again.');
      });
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = () => {
    setIsCheckingHealth(true);
    setHealthStatus(null);
    
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => {
        setHealthStatus(data);
      })
      .catch(err => {
        setHealthStatus({status: 'error', message: err.message});
      })
      .finally(() => {
        setIsCheckingHealth(false);
      });
  };

  return (
    <div className="form-container">
      <div style={{marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '8px'}}>
        <button 
          type="button"
          onClick={checkHealth}
          disabled={isCheckingHealth}
          style={{
            background: isCheckingHealth ? '#ccc' : '#2196f3',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: isCheckingHealth ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isCheckingHealth ? 'Checking...' : 'Check Server Health'}
        </button>
        
        {healthStatus && (
          <div style={{marginTop: '10px', fontSize: '12px', fontFamily: 'monospace'}}>
            Status: {healthStatus.status}
            {healthStatus.database && <div>Database: {healthStatus.database}</div>}
            {healthStatus.error && <div style={{color: 'red'}}>Error: {healthStatus.error}</div>}
            {healthStatus.message && <div>Message: {healthStatus.message}</div>}
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h2 className="page-title">Official User Registration</h2>
        <p style={{color: '#666', fontSize: '14px'}}>
          All fields are mandatory. Please provide accurate information as it appears on your National ID.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'rgba(0,188,212,0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid rgba(0,188,212,0.3)'
        }}>
          <h3 style={{color: '#00bcd4', margin: '0 0 20px 0'}}>Personal Information</h3>
          
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
              Full Names (as on National ID) *
            </label>
            <input 
              name="full_names" 
              placeholder="Enter your full names exactly as they appear on your ID"
              value={formData.full_names} 
              onChange={handleChange} 
              required 
              style={{textTransform: 'uppercase'}}
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                National ID Number *
              </label>
              <input 
                name="national_id" 
                placeholder="Enter your ID number"
                value={formData.national_id} 
                onChange={handleChange} 
                required 
                maxLength="8"
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                Phone Number *
              </label>
              <input 
                name="phone_number" 
                placeholder="+254XXXXXXXXX"
                value={formData.phone_number} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(76,175,80,0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid rgba(76,175,80,0.3)'
        }}>
          <h3 style={{color: '#4caf50', margin: '0 0 20px 0'}}>Location Information</h3>
          
          <div style={{marginBottom: '20px'}}>
            <button 
              type="button"
              onClick={captureGPSLocation}
              disabled={isCapturingLocation}
              style={{
                background: isCapturingLocation ? '#ccc' : 'linear-gradient(45deg, #4caf50, #45a049)',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                color: 'white',
                cursor: isCapturingLocation ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {isCapturingLocation ? 'Capturing...' : 'Capture GPS Location'}
            </button>
            {locationStatus && (
              <p style={{margin: '10px 0', fontSize: '14px', color: '#666'}}>{locationStatus}</p>
            )}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                County *
              </label>
              <select name="county" value={formData.county} onChange={handleChange} required>
                <option value="">Select County</option>
                {kenyanCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                Constituency *
              </label>
              <input 
                name="constituency" 
                placeholder="Enter constituency"
                value={formData.constituency} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
                Ward *
              </label>
              <input 
                name="ward" 
                placeholder="Enter ward"
                value={formData.ward} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
              Physical Location / Place of Residence *
            </label>
            <input 
              name="physical_location" 
              placeholder="Enter your specific location/address"
              value={formData.physical_location} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div style={{
          background: 'rgba(255,152,0,0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid rgba(255,152,0,0.3)'
        }}>
          <h3 style={{color: '#ff9800', margin: '0 0 20px 0'}}>Role & Category</h3>
          
          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333'}}>
              Select Your Role/Category *
            </label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Choose your role</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {successMessage && (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #a5d6a7'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ef9a9a'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: errorDetails ? '8px' : 0}}>
              {errorMessage}
            </div>
            {errorDetails && (
              <div style={{fontSize: '12px', opacity: 0.8, fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '4px'}}>
                {errorDetails}
              </div>
            )}
            <div style={{marginTop: '10px', fontSize: '12px', opacity: 0.7}}>
              Check browser console (F12) for more details
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            width: '100%', 
            padding: '18px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            background: isSubmitting ? '#ccc' : 'linear-gradient(45deg, #00bcd4, #0097a7)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '20px'
          }}
        >
          {isSubmitting ? 'Processing...' : 'Complete Official Registration'}
        </button>
      </form>
    </div>
  );
}

export default EnhancedRegistrationPro;

