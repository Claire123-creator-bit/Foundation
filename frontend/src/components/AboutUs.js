import React from 'react';

function AboutUs() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  return (
    <div className="form-container">
      <button onClick={goBack} style={{
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
      <h2 className="page-title">About Mbogo Foundation</h2>
      <p>Mbogo Foundation is dedicated to empowering communities through transparency, trust, and democratic participation. We believe in building stronger societies through civic engagement and community development.</p>
      
      <h3 className="section-title">Our Vision</h3>
      <p>To create transparent, accountable, and participatory governance that serves all community members.</p>
      
      <h3 className="section-title">Our Values</h3>
      <ul>
        <li>Transparency in all operations</li>
        <li>Community-centered approach</li>
        <li>Democratic participation</li>
        <li>Accountability and trust</li>
      </ul>
    </div>
  );
}

export default AboutUs;