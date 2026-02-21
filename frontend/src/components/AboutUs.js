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
        background: '#0A2463',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600'
      }}>
        Back to Home
      </button>
      
      <h2 className="page-title">About Mbogo Welfare Empowerment Foundation</h2>
      
      <div style={{
        background: '#0A2463',
        padding: '40px',
        borderRadius: '25px',
        color: '#FFFFFF',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700', color: '#FFFFFF'}}>Empowering Communities</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: '#FFFFFF'}}>
          Building stronger societies through transparency, trust, and democratic participation
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px'}}>
        <div style={{
          background: '#FFFFFF',
          padding: '35px',
          borderRadius: '25px',
          border: '1px solid #0A2463',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#0A2463', fontSize: '1.5em', marginBottom: '15px'}}>Our Mission</h3>
          <p style={{lineHeight: '1.7', color: '#0A2463'}}>
            To create transparent, accountable, and participatory governance that serves all community members with integrity and excellence.
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          padding: '35px',
          borderRadius: '25px',
          border: '1px solid #0A2463',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#0A2463', fontSize: '1.5em', marginBottom: '15px'}}>Our Vision</h3>
          <p style={{lineHeight: '1.7', color: '#0A2463'}}>
            A society where every voice matters, every decision is transparent, and every community member thrives through collective progress.
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          padding: '35px',
          borderRadius: '25px',
          border: '1px solid #0A2463',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#0A2463', fontSize: '1.5em', marginBottom: '15px'}}>Our Values</h3>
          <p style={{lineHeight: '1.7', color: '#0A2463'}}>
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
            background: '#FFFFFF',
            padding: '25px',
            borderRadius: '20px',
            border: '1px solid #0A2463'
          }}>
            <h4 style={{color: '#0A2463', marginBottom: '10px', fontSize: '1.2em'}}>{item.title}</h4>
            <p style={{fontSize: '14px', lineHeight: '1.6', color: '#0A2463'}}>{item.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title">Join Our Journey</h3>
      <div style={{
        background: '#0A2463',
        padding: '40px',
        borderRadius: '25px',
        color: '#FFFFFF',
        textAlign: 'center'
      }}>
        <h4 style={{fontSize: '1.8em', marginBottom: '15px', fontWeight: '700', color: '#FFFFFF'}}>Be Part of the Change</h4>
        <p style={{fontSize: '1.1em', lineHeight: '1.8', marginBottom: '25px', color: '#FFFFFF'}}>
          Together, we can build a stronger, more transparent, and more engaged community. 
          Join us today and make your voice heard.
        </p>
        <button 
          className="get-started-button"
          onClick={() => window.location.hash = '#signup'} 
          style={{
            background: '#FFFFFF',
            color: '#0A2463',
            padding: '18px 45px',
            fontSize: '16px',
            fontWeight: '700',
            border: '3px solid #FFFFFF',
            borderRadius: '50px',
            cursor: 'pointer'
          }}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
}

export default AboutUs;

