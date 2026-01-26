import React, { useState } from 'react';

function ContactUs() {
  const [formData, setFormData] = useState({name: '', email: '', message: ''});

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({name: '', email: '', message: ''});
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Contact Us</h2>
      
      <div className="contact-grid">
        <div className="info-card">
          <h3 className="section-title">Get in Touch</h3>
          <p><strong>Address:</strong> Mbogo Foundation Office, Nairobi, Kenya</p>
          <p><strong>Phone:</strong> +254-XXX-XXXX</p>
          <p><strong>Email:</strong> info@mbogofoundation.org</p>
          <p><strong>Office Hours:</strong> Mon-Fri 8:00 AM - 5:00 PM</p>
        </div>
        
        <form onSubmit={handleSubmit} className="info-card">
          <h3 className="section-title">Send Message</h3>
          <input 
            placeholder="Your Name" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required 
          />
          <input 
            type="email"
            placeholder="Your Email" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          <textarea 
            placeholder="Your Message"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            rows="5"
            required
          />
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;