import React, { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.national_id || formData.national_id.length < 7) {
      alert('Please enter a valid National ID number');
      return;
    }
    
    if (!formData.phone_number || formData.phone_number.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    fetch('http://localhost:5000/register-member-pro', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.member_data) {
          onRegistrationSuccess(data);
        } else {
          alert('Registration successful!');
        }
      })
      .catch(err => alert('Registration failed. Please try again.'));
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="form-container">
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h2 className="page-title">Official User Registration</h2>
        <p style={{color: '#666', fontSize: '14px'}}>
          All fields are mandatory. Please provide accurate information as it appears on your National ID.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
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

        {/* Location Information Section */}
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

        {/* Role Selection Section */}
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

        <button 
          type="submit" 
          style={{
            width: '100%', 
            padding: '18px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Complete Official Registration
        </button>
      </form>
    </div>
  );
}

export default EnhancedRegistrationPro;