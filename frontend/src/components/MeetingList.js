import React, { useEffect, useState } from 'react';
import CheckIn from './CheckIn';
import FeedbackForm from './FeedbackForm';
import API_BASE from '../utils/apiConfig';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.error(err));
  }, []);

  const handleRSVP = (meetingId) => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/meetings/${meetingId}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <p style={{color: '#0A2463'}}>No meetings scheduled.</p>
      ) : (
        meetings.map(meeting => (
          <div key={meeting.id} className="info-card">
            <h3 style={{color: '#0A2463'}}>{meeting.title}</h3>
            <p style={{color: '#0A2463'}}><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
            <p style={{color: '#0A2463'}}><strong>Time:</strong> {meeting.time}</p>
            <p style={{color: '#0A2463'}}><strong>Location:</strong> {meeting.location}</p>
            <p style={{color: '#0A2463'}}>{meeting.description}</p>
            {meeting.meeting_link && (
              <p><a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" style={{color: '#0A2463', textDecoration: 'underline'}}>Join Meeting</a></p>
            )}
            <button onClick={() => handleRSVP(meeting.id)} style={{
              padding: '10px 15px',
              background: '#0A2463',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}>RSVP</button>
            <CheckIn meetingId={meeting.id} />
            <FeedbackForm meetingId={meeting.id} />
          </div>
        ))
      )}
    </div>
  );
}

export default MeetingList;

