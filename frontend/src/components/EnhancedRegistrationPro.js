import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';

function EnhancedRegistrationPro({ signupPhone, onRegistrationSuccess }) {
  // Try to get stored signup data from localStorage
  const storedName = localStorage.getItem('signupName') || '';
  const storedId = localStorage.getItem('signupId') || '';
  
  const [formData, setFormData] = useState({
    full_names: storedName,
    national_id: storedId,
    phone_number: signupPhone || '',
    email: '',
    county: '',
    constituency: '',
    ward: '',
    physical_location: '',
    gps_latitude: '',
    gps_longitude: '',
    category: ''
  });

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

  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails('');
    setSuccessMessage('');
    setIsSubmitting(true);

    fetch(`${API_BASE}/register-member-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            try {
              const data = JSON.parse(text);
              throw new Error(data.error || `Server error (${res.status})`);
            } catch (e) {
              throw new Error(`Server error (${res.status})`);
            }
          });
        }
        return res.json();
      })
      .then(data => {
        setIsSubmitting(false);
        if (data.member_data || (data.message && data.user_id)) {
          setSuccessMessage('Registration successful! Redirecting...');
          onRegistrationSuccess(data);
        } else {
          setErrorMessage('Registration completed but unexpected response from server.');
        }
      })
      .catch(err => {
        setIsSubmitting(false);
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
      <div style={{marginBottom: '20px', padding: '10px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #0A2463'}}>
        <button 
          type="button"
          onClick={checkHealth}
          disabled={isCheckingHealth}
          style={{
            background: isCheckingHealth ? '#CCCCCC' : '#0A2463',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            color: '#FFFFFF',
            cursor: isCheckingHealth ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isCheckingHealth ? 'Checking...' : 'Check Server Health'}
        </button>
        
        {healthStatus && (
          <div style={{marginTop: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#0A2463'}}>
            Status: {healthStatus.status}
            {healthStatus.database && <div>Database: {healthStatus.database}</div>}
            {healthStatus.error && <div style={{color: '#0A2463'}}>Error: {healthStatus.error}</div>}
            {healthStatus.message && <div>Message: {healthStatus.message}</div>}
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h2 className="page-title">Official User Registration</h2>
        <p style={{color: '#0A2463', fontSize: '14px'}}>
          All fields are mandatory. Please provide accurate information as it appears on your National ID.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#FFFFFF', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid #0A2463'
        }}>
          <h3 style={{color: '#0A2463', margin: '0 0 20px 0'}}>Personal Information</h3>
          
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
                National Id Number *
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
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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

          <div style={{marginTop: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
              Email Address (Optional)
            </label>
            <input 
              name="email" 
              type="email"
              placeholder="Enter your email address"
              value={formData.email || ''} 
              onChange={handleChange} 
            />
            <small style={{color: '#0A2463', fontSize: '12px'}}>Enter your email to receive welcome notifications</small>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid #0A2463'
        }}>
          <h3 style={{color: '#0A2463', margin: '0 0 20px 0'}}>Location Information</h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
          background: '#FFFFFF', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          border: '1px solid #0A2463'
        }}>
          <h3 style={{color: '#0A2463', margin: '0 0 20px 0'}}>Role & Category</h3>
          
          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0A2463'}}>
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
            background: '#FFFFFF',
            color: '#0A2463',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #0A2463'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#FFFFFF',
            color: '#0A2463',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #0A2463'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: errorDetails ? '8px' : 0}}>
              {errorMessage}
            </div>
            {errorDetails && (
              <div style={{fontSize: '12px', fontFamily: 'monospace', background: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #0A2463'}}>
                {errorDetails}
              </div>
            )}
            <div style={{marginTop: '10px', fontSize: '12px'}}>
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
            background: isSubmitting ? '#CCCCCC' : '#0A2463',
            color: '#FFFFFF',
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

