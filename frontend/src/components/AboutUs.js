import React from 'react';

function AboutUs() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  return (
    <div className="form-container">
      <button onClick={goBack} style={{
        marginBottom: '30px',
        padding: '12px 30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600'
      }}>
        Back to Home
      </button>
      
      <h2 className="page-title">About Mbogo Foundation</h2>
      
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '25px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700'}}>Empowering Communities</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: 'rgba(255,255,255,0.95)'}}>
          Building stronger societies through transparency, trust, and democratic participation
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px'}}>
        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#667eea', fontSize: '1.5em', marginBottom: '15px'}}>Our Mission</h3>
          <p style={{lineHeight: '1.7'}}>
            To create transparent, accountable, and participatory governance that serves all community members with integrity and excellence.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#764ba2', fontSize: '1.5em', marginBottom: '15px'}}>Our Vision</h3>
          <p style={{lineHeight: '1.7'}}>
            A society where every voice matters, every decision is transparent, and every community member thrives through collective progress.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#f093fb', fontSize: '1.5em', marginBottom: '15px'}}>Our Values</h3>
          <p style={{lineHeight: '1.7'}}>
            Transparency, accountability, community engagement, democratic participation, and unwavering commitment to trust.
          </p>
        </div>
      </div>

      <h3 className="section-title">What We Stand For</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        {[
          {title: 'Transparency', desc: 'Open and honest communication in all our operations'},
          {title: 'Community First', desc: 'Putting community needs at the heart of everything we do'},
          {title: 'Democratic Values', desc: 'Ensuring every member has a voice and vote'},
          {title: 'Accountability', desc: 'Taking responsibility for our actions and decisions'},
          {title: 'Innovation', desc: 'Using technology to improve community engagement'},
          {title: 'Integrity', desc: 'Maintaining the highest ethical standards'}
        ].map((item, index) => (
          <div key={index} style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            padding: '25px',
            borderRadius: '20px',
            boxShadow: '0 5px 20px rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <h4 style={{color: '#667eea', marginBottom: '10px', fontSize: '1.2em'}}>{item.title}</h4>
            <p style={{fontSize: '14px', lineHeight: '1.6'}}>{item.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title">Join Our Journey</h3>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '25px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h4 style={{fontSize: '1.8em', marginBottom: '15px', fontWeight: '700'}}>Be Part of the Change</h4>
        <p style={{fontSize: '1.1em', lineHeight: '1.8', marginBottom: '25px', color: 'rgba(255,255,255,0.95)'}}>
          Together, we can build a stronger, more transparent, and more engaged community. 
          Join us today and make your voice heard.
        </p>
        <button onClick={() => window.location.hash = '#signup'} style={{
          background: 'white',
          color: '#667eea',
          padding: '18px 45px',
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
        }}>
          Get Started Now
        </button>
      </div>
    </div>
  );
}

export default AboutUs;
