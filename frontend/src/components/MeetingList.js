import React, { useEffect, useState } from 'react';
import CheckIn from './CheckIn';
import FeedbackForm from './FeedbackForm';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/meetings')
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.error(err));
  }, []);

  const handleRSVP = (meetingId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/meetings/${meetingId}/rsvp`, {
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
    <div style={{ padding: '20px' }}>
      <h2>Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <p>No meetings scheduled.</p>
      ) : (
        meetings.map(meeting => (
          <div key={meeting.id} style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '8px'
          }}>
            <h3>{meeting.title}</h3>
            <p><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {meeting.time}</p>
            <p><strong>Location:</strong> {meeting.location}</p>
            <p>{meeting.description}</p>
            {meeting.meeting_link && (
              <p><a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
            )}
            <button onClick={() => handleRSVP(meeting.id)} style={{
              padding: '10px 15px',
              background: '#00bcd4',
              color: 'white',
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
