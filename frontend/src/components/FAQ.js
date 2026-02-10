import React from 'react';

function FAQ() {
  const goBack = () => {
    window.location.hash = '#landing';
  };

  const faqs = [
    {
      q: "How do I become a member of Mbogo Welfare Empowerment Foundation?",
      a: "Click on 'Join Us' in the navigation menu and fill out the registration form with your details. Once submitted, your membership will be activated immediately."
    },
    {
      q: "What categories of membership are available?",
      a: "We offer various membership categories including Church Leader, Pastor, Village Elder, Agent, Youth Leader, Women Leader, Community Member, Government Official, NGO Representative, and Volunteer."
    },
    {
      q: "How can I support the foundation?",
      a: "You can support us through active participation in community programs, volunteering your time and skills, or contributing to our initiatives."
    },
    {
      q: "Is my personal information secure?",
      a: "Yes, we take data privacy very seriously. All member information is encrypted and protected according to our strict privacy policy and data protection standards."
    },
    {
      q: "How do I contact the foundation?",
      a: "You can reach us through the Contact Us page, call our office at +254 707 820 453, or email us at info@mbogofoundation.org during business hours."
    },
    {
      q: "Can I update my membership information?",
      a: "Yes, you can update your information by logging into your account and accessing your profile settings, or by contacting our support team."
    },
    {
      q: "How are meetings scheduled and announced?",
      a: "Meetings are scheduled through our platform and members receive SMS notifications and email updates about upcoming meetings and events."
    },
    {
      q: "What is the foundation's main mission?",
      a: "Our mission is to create transparent, accountable, and participatory governance that serves all community members through democratic engagement and community development."
    }
  ];

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
      
      <h2 className="page-title">Frequently Asked Questions</h2>
      
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '25px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700'}}>Have Questions?</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: 'rgba(255,255,255,0.95)'}}>
          Find answers to the most commonly asked questions about Mbogo Welfare Empowerment Foundation
        </p>
      </div>
      
      <div style={{display: 'grid', gap: '25px'}}>
        {faqs.map((faq, index) => (
          <div key={index} style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            padding: '30px',
            borderRadius: '25px',
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            borderLeft: '6px solid #667eea'
          }}>
            <h4 style={{color: '#667eea', marginBottom: '15px', fontSize: '1.3em', fontWeight: '700'}}>{faq.q}</h4>
            <p style={{margin: '0', color: '#4a5568', lineHeight: '1.8', fontSize: '15px'}}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        padding: '40px',
        borderRadius: '25px',
        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <h3 style={{color: '#2d3748', fontSize: '1.8em', marginBottom: '15px', fontWeight: '700'}}>Still Have Questions?</h3>
        <p style={{color: '#4a5568', fontSize: '1.1em', lineHeight: '1.8', marginBottom: '25px'}}>
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <button onClick={() => window.location.hash = '#contact'} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '18px 45px',
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
        }}>
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default FAQ;
