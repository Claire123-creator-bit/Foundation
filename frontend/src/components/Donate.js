import React, { useState, useEffect } from 'react';

function Donate() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Pre-fill user data if available
    const storedName = localStorage.getItem('userName') || '';
    const storedPhone = localStorage.getItem('userPhone') || '';
    
    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);
    
    // Mark as loaded immediately
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for your donation of KES ${amount}! We will send payment instructions to ${phone}`);
    setAmount('');
    setName('');
    setPhone('');
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Support Our Mission</h2>
      
      <div style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '40px',
        borderRadius: '25px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '2em', marginBottom: '15px', fontWeight: '700'}}>Make a Difference Today</h3>
        <p style={{fontSize: '1.2em', lineHeight: '1.8', color: 'rgba(255,255,255,0.95)'}}>
          Your donation helps us empower communities and create positive change
        </p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px'}}>
        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          boxShadow: '0 8px 30px rgba(30, 60, 114, 0.15)',
          border: '1px solid rgba(30, 60, 114, 0.1)'
        }}>
          <h3 style={{color: '#1e3c72', fontSize: '1.5em', marginBottom: '25px', fontWeight: '700'}}>Why Donate?</h3>
          
          <div style={{marginBottom: '20px'}}>
            <h4 style={{color: '#2d3748', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Community Development</h4>
            <p style={{color: '#4a5568', lineHeight: '1.6'}}>Support programs that strengthen our communities</p>
          </div>

          <div style={{marginBottom: '20px'}}>
            <h4 style={{color: '#2d3748', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Transparency</h4>
            <p style={{color: '#4a5568', lineHeight: '1.6'}}>100% accountability on how funds are used</p>
          </div>

          <div>
            <h4 style={{color: '#2d3748', fontSize: '1.1em', marginBottom: '8px', fontWeight: '600'}}>Impact</h4>
            <p style={{color: '#4a5568', lineHeight: '1.6'}}>Every contribution makes a real difference</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          padding: '35px',
          borderRadius: '25px',
          boxShadow: '0 8px 30px rgba(30, 60, 114, 0.15)',
          border: '1px solid rgba(30, 60, 114, 0.1)'
        }}>
          <h3 style={{color: '#1e3c72', fontSize: '1.5em', marginBottom: '25px', fontWeight: '700'}}>Donation Details</h3>
          
          <label style={{display: 'block', marginBottom: '8px'}}>Your Name</label>
          <input 
            placeholder="Enter your full name" 
            value={name}
            onChange={e => setName(e.target.value)}
            required 
          />
          
          <label style={{display: 'block', marginBottom: '8px'}}>Phone Number</label>
          <input 
            placeholder="+254XXXXXXXXX" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required 
          />
          
          <label style={{display: 'block', marginBottom: '8px'}}>Donation Amount (KES)</label>
          <input 
            type="number"
            placeholder="Enter amount" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required 
            min="100"
          />
          
          <button type="submit" style={{width: '100%', marginTop: '10px'}}>Donate Now</button>
        </form>
      </div>


    </div>
  );
}

export default Donate;
