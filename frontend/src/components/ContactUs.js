import React, { useState } from 'react';

function ContactUs() {
  const [formData, setFormData] = useState({name: '', phone: '', call_type: 'inquiry', message: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goBack = () => {
    window.location.hash = '#landing';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/log-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thank you for your message. We will get back to you soon!');
        setFormData({name: '', phone: '', call_type: 'inquiry', message: ''});
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      
      <h2 className="page-title">Contact Us</h2>
      
      <div style={{
        background: '#0A2463',
        padding: '40px',
        borderRadius: '25px',
        color: '#FFFFFF',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700', color: '#FFFFFF'}}>Get In Touch</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: '#FFFFFF'}}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px'}}>
        <div style={{
          background: '#FFFFFF',
          padding: '35px',
          borderRadius: '25px',
          border: '1px solid #0A2463'
        }}>
          <h3 style={{color: '#0A2463', fontSize: '1.5em', marginBottom: '25px', fontWeight: '700'}}>Contact Information</h3>
          
          <div style={{marginBottom: '20px'}}>
            <h4 style={{color: '#0A2463', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Address</h4>
            <p style={{color: '#0A2463', lineHeight: '1.6'}}>Mbogo Welfare Empowerment Foundation Office<br/>Nairobi, Kenya</p>
          </div>

          <div style={{marginBottom: '20px'}}>
            <h4 style={{color: '#0A2463', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Phone</h4>
            <p style={{color: '#0A2463'}}>+254 707 820 453</p>
          </div>

          <div style={{marginBottom: '20px'}}>
            <h4 style={{color: '#0A2463', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Email</h4>
            <p style={{color: '#0A2463'}}>info@mbogofoundation.org</p>
          </div>

          <div>
            <h4 style={{color: '#0A2463', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Office Hours</h4>
            <p style={{color: '#0A2463'}}>Monday - Friday<br/>8:00 AM - 5:00 PM<br/><br/>Saturday<br/>8:00 AM - 12:00 PM</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          background: '#FFFFFF',
          padding: '35px',
          borderRadius: '25px',
          border: '1px solid #0A2463'
        }}>
          <h3 style={{color: '#0A2463', fontSize: '1.5em', marginBottom: '25px', fontWeight: '700'}}>Send Us a Message</h3>
          
          <label style={{display: 'block', marginBottom: '8px', color: '#0A2463'}}>Your Name</label>
          <input 
            placeholder="Enter your full name" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required 
          />
          
          <label style={{display: 'block', marginBottom: '8px', color: '#0A2463'}}>Your Email</label>
          <input 
            type="email"
            placeholder="Enter your email address" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          
          <label style={{display: 'block', marginBottom: '8px', color: '#0A2463'}}>Your Message</label>
          <textarea 
            placeholder="Type your message here..."
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            rows="6"
            required
          />
          
          <button type="submit" style={{width: '100%', marginTop: '10px'}} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div style={{
        background: '#FFFFFF',
        padding: '40px',
        borderRadius: '25px',
        border: '1px solid #0A2463',
        textAlign: 'center'
      }}>
        <h3 style={{color: '#0A2463', fontSize: '1.8em', marginBottom: '15px', fontWeight: '700'}}>Visit Our Office</h3>
        <p style={{color: '#0A2463', fontSize: '1.1em', lineHeight: '1.8', marginBottom: '20px'}}>
          We welcome visitors during office hours. Feel free to drop by for a chat or to learn more about our work.
        </p>
      </div>
    </div>
  );
}

export default ContactUs;

