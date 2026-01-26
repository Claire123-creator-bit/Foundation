import React from 'react';

function FAQ() {
  const faqs = [
    {
      q: "How do I become a member of Mbogo Foundation?",
      a: "Click on 'Join Us' in the navigation menu and fill out the registration form with your details."
    },
    {
      q: "What categories of membership are available?",
      a: "We have Volunteer, Donor, Voter, Party Member, Official, and Supporter categories."
    },
    {
      q: "How can I support the foundation?",
      a: "You can support us through donations, volunteering, or participating in our community programs."
    },
    {
      q: "Is my personal information secure?",
      a: "Yes, we take data privacy seriously and protect all member information according to our privacy policy."
    },
    {
      q: "How do I contact the foundation?",
      a: "You can reach us through the Contact Us page, phone, or email listed on our website."
    }
  ];

  return (
    <div className="form-container">
      <h2 className="page-title">Frequently Asked Questions</h2>
      
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <h4 style={{color: '#00bcd4', marginBottom: '10px'}}>{faq.q}</h4>
          <p style={{margin: '0', color: '#666'}}>{faq.a}</p>
        </div>
      ))}
    </div>
  );
}

export default FAQ;