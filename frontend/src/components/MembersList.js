import React, { useEffect, useState } from 'react';

function MembersList({ userRole, userId }) {
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMembers = (category = '') => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Role': userRole || 'member',
      'User-ID': userId || ''
    };
    
    if (userRole === 'admin') {
      const url = category ? `https://foundation-0x4i.onrender.com/members?category=${category}` : 'https://foundation-0x4i.onrender.com/members';
      fetch(url, { headers })
        .then(res => res.json())
        .then(data => {
          setMembers(data);
          setLoading(false);
        })
        .catch(err => {
          console.log('Backend offline');
          setLoading(false);
        });
    } else {
      fetch(`https://foundation-0x4i.onrender.com/member-profile?member_id=${userId}`, { headers })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setMembers([data]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.log('Backend offline');
          setLoading(false);
        });
    }
  };

  const fetchCategories = () => {
    if (userRole === 'admin') {
      fetch('https://foundation-0x4i.onrender.com/members/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.log('Backend offline'));
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

      {members.length > 0 ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {members.map(member => (
            <div key={member.id} className="faq-item">
              <h4 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>
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

