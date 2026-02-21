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
      a: "Yes, you can update your information by Logging into your account and accessing your profile settings, or by contacting our support team."
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
      
      <h2 className="page-title">Frequently Asked Questions</h2>
      
      <div style={{
        background: '#0A2463',
        padding: '40px',
        borderRadius: '25px',
        color: '#FFFFFF',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700', color: '#FFFFFF'}}>Have Questions?</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: '#FFFFFF'}}>
          Find answers to the most commonly asked questions about Mbogo Welfare Empowerment Foundation
        </p>
      </div>
      
      <div style={{display: 'grid', gap: '25px'}}>
        {faqs.map((faq, index) => (
          <div key={index} style={{
            background: '#FFFFFF',
            padding: '30px',
            borderRadius: '25px',
            border: '1px solid #0A2463',
            borderLeft: '6px solid #0A2463'
          }}>
            <h4 style={{color: '#0A2463', marginBottom: '15px', fontSize: '1.3em', fontWeight: '700'}}>{faq.q}</h4>
            <p style={{margin: '0', color: '#0A2463', lineHeight: '1.8', fontSize: '15px'}}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: '#FFFFFF',
        padding: '40px',
        borderRadius: '25px',
        border: '1px solid #0A2463',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <h3 style={{color: '#0A2463', fontSize: '1.8em', marginBottom: '15px', fontWeight: '700'}}>Still Have Questions?</h3>
        <p style={{color: '#0A2463', fontSize: '1.1em', lineHeight: '1.8', marginBottom: '25px'}}>
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <button onClick={() => window.location.hash = '#contact'} style={{
          background: '#0A2463',
          color: '#FFFFFF',
          padding: '18px 45px',
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer'
        }}>
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default FAQ;

