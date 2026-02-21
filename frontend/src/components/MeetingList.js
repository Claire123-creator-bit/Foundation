import React, { useEffect, useState } from 'react';
import CheckIn from './CheckIn';
import FeedbackForm from './FeedbackForm';
import API_BASE from '../utils/apiConfig';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    venue: '',
    meeting_link: '',
    meeting_type: 'physical'
  });
  
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = () => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.error(err));
  };

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

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Role': 'admin'
      },
      body: JSON.stringify(newMeeting)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Meeting created successfully!');
          setShowCreateForm(false);
          setNewMeeting({
            title: '',
            date: '',
            time: '',
            description: '',
            venue: '',
            meeting_link: '',
            meeting_type: 'physical'
          });
          fetchMeetings();
        } else {
          alert(data.error || 'Failed to create meeting');
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <div className="form-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 className="page-title" style={{margin: 0}}>Upcoming Meetings</h2>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '10px 20px',
              background: '#0A2463',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : '+ Create Meeting'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="info-card" style={{marginBottom: '30px'}}>
          <h3 style={{color: '#0A2463', marginBottom: '20px'}}>Create New Meeting</h3>
          <form onSubmit={handleCreateMeeting}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Meeting Title *</label>
                <input 
                  type="text"
                  value={newMeeting.title}
                  onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
                  required
                  placeholder="Enter meeting title"
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Meeting Type</label>
                <select
                  value={newMeeting.meeting_type}
                  onChange={e => setNewMeeting({...newMeeting, meeting_type: e.target.value})}
                >
                  <option value="physical">Physical Meeting</option>
                  <option value="online">Online Meeting</option>
                </select>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Date *</label>
                <input 
                  type="date"
                  value={newMeeting.date}
                  onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Time *</label>
                <input 
                  type="time"
                  value={newMeeting.time}
                  onChange={e => setNewMeeting({...newMeeting, time: e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Venue / Location</label>
              <input 
                type="text"
                value={newMeeting.venue}
                onChange={e => setNewMeeting({...newMeeting, venue: e.target.value})}
                placeholder="Enter venue or physical location"
              />
            </div>
            {newMeeting.meeting_type === 'online' && (
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Meeting Link (Zoom/Google Meet)</label>
                <input 
                  type="url"
                  value={newMeeting.meeting_link}
                  onChange={e => setNewMeeting({...newMeeting, meeting_link: e.target.value})}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                />
              </div>
            )}
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '5px', color: '#0A2463', fontWeight: 'bold'}}>Description</label>
              <textarea 
                value={newMeeting.description}
                onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
                rows="3"
                placeholder="Enter meeting description or agenda"
              />
            </div>
            <button type="submit" style={{
              padding: '12px 24px',
              background: '#0A2463',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              Create Meeting
            </button>
          </form>
        </div>
      )}

      {meetings.length === 0 ? (
        <p style={{color: '#0A2463'}}>No meetings scheduled.</p>
      ) : (
        meetings.map(meeting => (
          <div key={meeting.id} className="info-card">
            <h3 style={{color: '#0A2463'}}>{meeting.title}</h3>
            <p style={{color: '#0A2463'}}><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
            <p style={{color: '#0A2463'}}><strong>Time:</strong> {meeting.time}</p>
            <p style={{color: '#0A2463'}}><strong>Location:</strong> {meeting.venue || 'Not specified'}</p>
            <p style={{color: '#0A2463'}}>{meeting.agenda || meeting.description}</p>
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

