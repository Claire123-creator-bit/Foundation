import React, { useEffect, useState } from 'react';
import API_BASE from '../utils/apiConfig';

function MembersList({ userRole, userId }) {
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMembers = (category = '') => {
    setErrorMessage('');
    const headers = {
      'Content-Type': 'application/json',
      'User-Role': userRole || 'member',
      'User-ID': userId || ''
    };
    
    const url = category && userRole === 'admin' 
      ? `${API_BASE}/members?category=${category}` 
      : `${API_BASE}/members`;
    
    fetch(url, { headers })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          console.error('Unexpected response format:', data);
          setMembers([]);
          setErrorMessage(data.error || data.message || 'Invalid response from server');
        }
        setLoading(false);
      })
      .catch(err => {
        console.log('Error fetching members', err);
        setErrorMessage(err.message || 'Failed to fetch members');
        setMembers([]);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    if (userRole === 'admin') {
      const headers = {
        'Content-Type': 'application/json',
        'User-Role': userRole || 'admin',
        'User-ID': userId || ''
      };
      fetch(`${API_BASE}/members/categories`, { headers })
        .then(res => {
          if (!res.ok) {
            // Endpoint doesn't exist, just ignore
            setCategories([]);
            return [];
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setCategories(data);
          }
        })
        .catch(() => {
          setCategories([]);
        });
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchCategories();
  }, [userRole, userId]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    fetchMembers(category);
  };

  if (loading) {
    return (
      <div className="form-container">
        <div style={{textAlign: 'center', padding: '50px'}}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="page-title">
        {userRole === 'admin' ? 'All Community Members' : 'My Profile'}
      </h2>
      
      {userRole === 'admin' && (
        <div style={{marginBottom: '30px'}}>
          <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>
            Filter by Category:
          </label>
          <select 
            value={selectedCategory} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{maxWidth: '300px'}}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{marginBottom: '20px', textAlign: 'center'}}>
        <p style={{color: '#666', fontSize: '14px'}}>
          {userRole === 'admin' 
            ? `Showing ${members.length} member${members.length !== 1 ? 's' : ''}${selectedCategory && ` in ${selectedCategory} category`}`
            : 'Your member profile information'}
        </p>
      </div>

      {errorMessage && (
        <div style={{textAlign: 'center', padding: '10px', color: 'red'}}>
          <p>{errorMessage}</p>
        </div>
      )}

      {members.length > 0 ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {members.map(member => (
            <div key={member.id} className="faq-item">
              <h4 style={{color: '#1a237e', margin: '0 0 10px 0'}}>
                {member.full_names || member.name}
              </h4>
              <div style={{fontSize: '14px', color: '#666', lineHeight: '1.6'}}>
                <p style={{margin: '5px 0'}}>
                  <strong>National ID:</strong> {member.national_id || member.id_no || 'N/A'}
                </p>
                <p style={{margin: '5px 0'}}>
                  <strong>Category:</strong> {member.category}
                </p>
                <p style={{margin: '5px 0'}}>
                  <strong>Location:</strong> {member.ward} Ward, {member.constituency}, {member.county}
                </p>
                <p style={{margin: '5px 0'}}>
                  <strong>Phone:</strong> {member.phone_number || member.phone}
                </p>
                {member.registration_date && (
                  <p style={{margin: '5px 0'}}>
                    <strong>Registered:</strong> {new Date(member.registration_date).toLocaleDateString()}
                  </p>
                )}
                {member.is_verified && (
                  <span style={{
                    background: '#4caf50',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    marginTop: '10px',
                    display: 'inline-block'
                  }}>
                    Verified Member
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '50px'}}>
          <p style={{color: '#666'}}>
            {userRole === 'admin' 
              ? `No members found${selectedCategory && ` in ${selectedCategory} category`}.`
              : 'No profile information found.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MembersList;

