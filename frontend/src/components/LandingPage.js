import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';
import './LandingPage.css';

const mbogoBackground = '/mbogo-background.jpeg';


const LandingPage = ({ onJoinUs, onAdminLogin }) => {
  const [media, setMedia] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mediaRes, sectionsRes] = await Promise.all([
        fetch(`${API_BASE}/media`),
        fetch(`${API_BASE}/activities`),
      ]);
      if (mediaRes.ok) { const d = await mediaRes.json(); setMedia(Array.isArray(d) ? d : []); }
      if (sectionsRes.ok) { const d = await sectionsRes.json(); setSections(Array.isArray(d) ? d : []); }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={s.page}>
      <nav className="landing-navbar">
        <div className="landing-navbar-desktop">
          <div className="landing-logo">
            <img src={mbogoBackground} alt="Mbogo Foundation" className="landing-logo-image" />
            <span className="landing-logo-text">Mbogo Foundation</span>
          </div>

          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => scrollToSection('about')}>About</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('what-we-do')}>What We Do</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('activities')}>Activities</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('media')}>Media</button>
            <button className="landing-nav-link" onClick={() => scrollToSection('contact')}>Contact</button>
            <button className="landing-join-button" onClick={onJoinUs}>Join Us Now</button>
            <button className="landing-admin-btn" onClick={onAdminLogin}>Admin</button>
          </div>

          <div className="landing-menu-container">
            <button className="landing-menu-button" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? '✕' : '☰'}
            </button>

            {showMenu && (
              <div className="landing-dropdown-menu">
                <button className="landing-menu-item" onClick={() => { scrollToSection('about'); setShowMenu(false); }}>About</button>
                <button className="landing-menu-item" onClick={() => { scrollToSection('what-we-do'); setShowMenu(false); }}>What We Do</button>
                <button className="landing-menu-item" onClick={() => { scrollToSection('activities'); setShowMenu(false); }}>Activities</button>
                <button className="landing-menu-item" onClick={() => { scrollToSection('media'); setShowMenu(false); }}>Media</button>
                <button className="landing-menu-item" onClick={() => { scrollToSection('contact'); setShowMenu(false); }}>Contact</button>
                <button className="landing-menu-item" onClick={() => { onJoinUs(); setShowMenu(false); }}>Join Us Now</button>
                <button className="landing-menu-item" onClick={() => { onAdminLogin(); setShowMenu(false); }}>Admin Login</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>Empowering Communities Through Unity</h1>
          <p style={s.heroSubtitle}>Mbogo Welfare Empowerment Foundation</p>
          <div style={s.heroButtons}>
            <button style={s.primaryButton} onClick={onJoinUs}>Join Us Now</button>
            <button style={s.secondaryButton} onClick={() => scrollToSection('about')}>Learn More</button>
          </div>
        </div>
      </section>

      <section id="about" style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>About Us</h2>
          <div style={s.sectionContent}>
            <p style={s.text}>
              The Mbogo Welfare Empowerment Foundation is dedicated to uplifting communities through 
              sustainable development, education, and social empowerment initiatives. We believe in 
              the power of unity and collective action to create lasting positive change.
            </p>
            <p style={s.text}>
              Our mission is to empower individuals and communities by providing resources, education, 
              and opportunities that foster growth and self-sufficiency. Together, we can build a brighter 
              future for all.
            </p>
          </div>
        </div>
      </section>

      <section id="what-we-do" style={s.sectionAlt}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>What We Do</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Community Development</h3>
              <p style={s.cardText}>Building stronger communities through collaborative projects and initiatives.</p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Education Support</h3>
              <p style={s.cardText}>Providing educational resources and opportunities for learners of all ages.</p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Social Empowerment</h3>
              <p style={s.cardText}>Empowering individuals with skills and resources for self-sufficiency.</p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Health Initiatives</h3>
              <p style={s.cardText}>Promoting health and wellness through community health programs.</p>
            </div>
          </div>
        </div>
      </section>



      <section id="media" style={s.sectionAlt}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Our Work in Action</h2>
          {loading ? (
            <p style={s.text}>Loading media...</p>
          ) : media.length === 0 ? (
            <p style={s.text}>No media available yet.</p>
          ) : (() => {
            const grouped = {};
            const unsectioned = [];
            media.forEach(item => {
              if (item.activity_id) {
                if (!grouped[item.activity_id]) grouped[item.activity_id] = [];
                grouped[item.activity_id].push(item);
              } else { unsectioned.push(item); }
            });
            const renderGrid = (items) => (
              <div style={s.mediaGrid}>
                {items.map(item => (
                  <div key={item.id} style={s.mediaItem}>
                    {item.media_type === 'video' ? (
                      <video controls style={s.mediaContent}>
                        <source src={item.file_path} type={`video/${item.file_type}`} />
                      </video>
                    ) : (
                      <img src={item.file_path} alt={item.title} style={s.mediaContent} />
                    )}
                    <div style={s.mediaInfo}>
                      <h4 style={s.mediaTitle}>{item.title}</h4>
                      {item.description && <p style={s.mediaDescription}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            );
            return (
              <>
                {sections.map(sec => (grouped[sec.id] || []).length > 0 && (
                  <div key={sec.id} style={{ marginBottom: 48 }}>
                    <h3 style={s.sectionSubTitle}>{sec.title}</h3>
                    {sec.description && <p style={{ ...s.text, marginBottom: 16 }}>{sec.description}</p>}
                    {renderGrid(grouped[sec.id])}
                  </div>
                ))}
                {unsectioned.length > 0 && (
                  <div style={{ marginBottom: 48 }}>
                    <h3 style={s.sectionSubTitle}>General</h3>
                    {renderGrid(unsectioned)}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      <section id="contact" style={s.sectionAlt}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Contact Us</h2>
          <div style={s.contactContent}>
            <div style={s.contactInfo}>
              <h3 style={s.contactTitle}>Get in Touch</h3>
              <p style={s.text}>
                Have questions or want to get involved? We'd love to hear from you.
              </p>
              <div style={s.contactDetails}>
                <p style={s.contactItem}>📧 mbogoempowermentfoundation@gmail.com</p>
                <p style={s.contactItem}>📱 0143235490</p>
                <p style={s.contactItem}>📍 Murang'a County, Kenya</p>
              </div>
            </div>
            <div style={s.contactForm}>
              <form style={s.form}>
                <input type="text" placeholder="Your Name" style={s.input} />
                <input type="email" placeholder="Your Email" style={s.input} />
                <textarea placeholder="Your Message" rows="4" style={s.textarea}></textarea>
                <button type="submit" style={s.submitButton}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.footerContent}>
          <p style={s.footerText}>
            © {new Date().getFullYear()} Mbogo Welfare Empowerment Foundation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const s = {
page: { minHeight: '100vh', backgroundImage: `url(${mbogoBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column' },
  hero: {
    height: '90vh',
    backgroundImage: 'linear-gradient(rgba(10,36,99,0.6), rgba(10,36,99,0.6)),(url("/mbogo-background.jpeg"))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '32px',
    marginTop: '72px',
  },
  heroContent: { maxWidth: '800px' },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 700,
    marginBottom: '16px',
    lineHeight: 1.2,
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 'clamp(18px, 3vw, 24px)',
    fontWeight: 300,
    marginBottom: '32px',
    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
  },
  heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryButton: {
    background: '#fff',
    color: '#0A2463',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '32px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  secondaryButton: {
    background: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
    padding: '14px 38px',
    borderRadius: '32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  // Allow the global background image to show through on every section
  section: { padding: '80px 32px', backgroundColor: 'transparent', flex: '0 0 auto' },
  sectionAlt: { padding: '80px 32px', backgroundColor: 'transparent', flex: '0 0 auto' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: 700,
    color: '#0A2463',
    textAlign: 'center',
    marginBottom: '48px',
    textShadow: '0 2px 4px rgba(255,255,255,0.8)',
  },
  sectionContent: { maxWidth: '800px', margin: '0 auto' },
  text: {
    fontSize: '16px',
    lineHeight: 1.8,
    color: '#333',
    marginBottom: '16px',
    textShadow: '0 1px 3px rgba(255,255,255,0.6)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
  },
  card: {
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0A2463',
    marginBottom: '12px',
  },
  cardText: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#666',
  },
  activityCard: {
    background: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px',
    borderLeft: '4px solid #0A2463',
    transition: 'transform 0.2s',
  },
  smallText: {
    fontSize: '13px',
    color: '#666',
    margin: '8px 0',
  },
  sectionSubTitle: {
    fontSize: 'clamp(20px, 3vw, 28px)',
    fontWeight: 700,
    color: '#0A2463',
    marginBottom: '20px',
    paddingBottom: '8px',
    borderBottom: '3px solid #0A2463',
    textTransform: 'capitalize',
    textShadow: '0 1px 3px rgba(255,255,255,0.7)',
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  mediaItem: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  mediaContent: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
  },
  mediaInfo: { padding: '16px' },
  mediaTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0A2463',
    marginBottom: '8px',
  },
  mediaDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  contactContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '48px',
  },
  contactTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0A2463',
    marginBottom: '16px',
    textShadow: '0 1px 3px rgba(255,255,255,0.7)',
  },
  contactDetails: { marginTop: '24px' },
  contactItem: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textShadow: '0 1px 2px rgba(255,255,255,0.5)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitButton: {
    background: '#0A2463',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  footer: {
    backgroundColor: '#0A2463',
    padding: '32px',
    textAlign: 'center',
    marginTop: 'auto',
    maxWidth: '100%',
  },
  footerContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
};

export default LandingPage;
