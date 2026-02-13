import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function MeetingMinutes({ userRole, userId }) {
  const isAdmin = userRole === 'admin';
  
  const [meetings, setMeetings] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [activeSection, setActiveSection] = useState('view');
  
  const [minutesForm, setMinutesForm] = useState({
    meeting_id: '',
    secretary_name: '',
    content: '',
    attendees_present: '',
    attendees_absent: '',
    action_items: '',
    next_meeting_date: ''
  });

  useEffect(() => {
    fetchMeetings();
    fetchMinutes();
  }, []);

  const fetchMeetings = () => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchMinutes = () => {
    fetch(`${API_BASE}/meeting-minutes`)
      .then(res => res.json())
      .then(data => setMinutes(data))
      .catch(err => {
        console.log('Backend offline');
        setMinutes([]);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/meeting-minutes`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(minutesForm)
    })
      .then(res => res.json())
      .then(data => {
        alert('Meeting minutes saved successfully!');
        setMinutesForm({
          meeting_id: '',
          secretary_name: '',
          content: '',
          attendees_present: '',
          attendees_absent: '',
          action_items: '',
          next_meeting_date: ''
        });
        fetchMinutes();
      })
      .catch(err => alert('Backend offline. Please start the Flask server.'));
  };

  const selectedMeeting = meetings.find(m => m.id === parseInt(minutesForm.meeting_id));

  return (
    <div className="form-container">
      <h2 className="page-title">📝 Meeting Minutes</h2>
      
      <nav style={{display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center'}}>
        {isAdmin && (
          <button 
            onClick={() => setActiveSection('create')}
            style={{
              padding: '10px 20px', 
              borderRadius: '8px', 
              background: activeSection === 'create' ? '#00bcd4' : '#f0f0f0',
              color: activeSection === 'create' ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✍️ Write Minutes
          </button>
        )}
        <button 
          onClick={() => setActiveSection('view')}
          style={{
            padding: '10px 20px', 
            borderRadius: '8px', 
            background: activeSection === 'view' ? '#00bcd4' : '#f0f0f0',
            color: activeSection === 'view' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📋 View Minutes ({minutes.length})
        </button>
      </nav>

      {activeSection === 'create' && isAdmin && (
        <div>
          <h3 className="section-title">✍️ Create Meeting Minutes</h3>
          <form onSubmit={handleSubmit} className="info-card">
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Select Meeting:</label>
                <select
                  value={minutesForm.meeting_id}
                  onChange={e => setMinutesForm({...minutesForm, meeting_id: e.target.value})}
                  required
                >
                  <option value="">Choose Meeting</option>
                  {meetings.map(meeting => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title} - {meeting.date}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Secretary Name:</label>
                <input 
                  placeholder="Secretary taking minutes"
                  value={minutesForm.secretary_name}
                  onChange={e => setMinutesForm({...minutesForm, secretary_name: e.target.value})}
                  required
                />
              </div>
            </div>

            {selectedMeeting && (
              <div style={{
                padding: '15px', 
                background: 'rgba(0,188,212,0.1)', 
                borderRadius: '8px', 
                border: '1px solid #00bcd4',
                marginBottom: '20px'
              }}>
                <h4 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>📋 Meeting Details</h4>
                <p style={{margin: '5px 0'}}><strong>Title:</strong> {selectedMeeting.title}</p>
                <p style={{margin: '5px 0'}}><strong>Date:</strong> {selectedMeeting.date} at {selectedMeeting.time}</p>
                <p style={{margin: '5px 0'}}><strong>Venue:</strong> {selectedMeeting.venue || selectedMeeting.meeting_link}</p>
              </div>
            )}
            
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Meeting Content & Discussions:</label>
              <textarea 
                placeholder="Write what was discussed in the meeting..."
                value={minutesForm.content}
                onChange={e => setMinutesForm({...minutesForm, content: e.target.value})}
                rows="8"
                required
                style={{minHeight: '200px'}}
              />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Members Present:</label>
                <textarea 
                  placeholder="List members who attended..."
                  value={minutesForm.attendees_present}
                  onChange={e => setMinutesForm({...minutesForm, attendees_present: e.target.value})}
                  rows="4"
                />
              </div>
              
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Members Absent:</label>
                <textarea 
                  placeholder="List members who were absent..."
                  value={minutesForm.attendees_absent}
                  onChange={e => setMinutesForm({...minutesForm, attendees_absent: e.target.value})}
                  rows="4"
                />
              </div>
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Action Items & Decisions:</label>
              <textarea 
                placeholder="List decisions made and action items..."
                value={minutesForm.action_items}
                onChange={e => setMinutesForm({...minutesForm, action_items: e.target.value})}
                rows="4"
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#00bcd4'}}>Next Meeting Date (Optional):</label>
              <input 
                type="date"
                value={minutesForm.next_meeting_date}
                onChange={e => setMinutesForm({...minutesForm, next_meeting_date: e.target.value})}
              />
            </div>
            
            <button type="submit" style={{width: '100%', padding: '15px', fontSize: '16px', marginTop: '20px'}}>
              📝 Save Meeting Minutes
            </button>
          </form>
        </div>
      )}

      {activeSection === 'view' && (
        <div>
          <h3 className="section-title">📋 Meeting Minutes Records</h3>
          {minutes.length > 0 ? (
            minutes.map(minute => (
              <div key={minute.id} className="faq-item" style={{marginBottom: '25px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                  <div>
                    <h4 style={{color: '#00bcd4', margin: '0 0 5px 0'}}>{minute.meeting_title}</h4>
                    <p style={{margin: '0', color: '#666', fontSize: '14px'}}>
                      📅 {minute.meeting_date} | ✍️ Secretary: {minute.secretary_name} | 📝 {new Date(minute.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    style={{fontSize: '12px', padding: '8px 16px'}}
                  >
                    🖨️ Print
                  </button>
                </div>
                
                <div style={{background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                  <h5 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>📝 Meeting Content:</h5>
                  <p style={{margin: '0', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>{minute.content}</p>
                </div>
                
                {minute.attendees_present && (
                  <div style={{marginBottom: '10px'}}>
                    <strong style={{color: '#4caf50'}}>✅ Present:</strong>
                    <p style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{minute.attendees_present}</p>
                  </div>
                )}
                
                {minute.attendees_absent && (
                  <div style={{marginBottom: '10px'}}>
                    <strong style={{color: '#f44336'}}>❌ Absent:</strong>
                    <p style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{minute.attendees_absent}</p>
                  </div>
                )}
                
                {minute.action_items && (
                  <div style={{marginBottom: '10px'}}>
                    <strong style={{color: '#ff9800'}}>📋 Action Items:</strong>
                    <p style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{minute.action_items}</p>
                  </div>
                )}
                
                {minute.next_meeting_date && (
                  <div>
                    <strong style={{color: '#00bcd4'}}>📅 Next Meeting:</strong>
                    <span style={{marginLeft: '10px'}}>{minute.next_meeting_date}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No meeting minutes recorded yet. Create your first minutes above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MeetingMinutes;

