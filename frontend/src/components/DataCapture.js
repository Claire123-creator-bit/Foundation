import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function DataCapture() {
  const [activeSection, setActiveSection] = useState('meetings');
  const [meetings, setMeetings] = useState([]);

  const [members, setMembers] = useState([]);

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    agenda: '',
    category: '',
    meeting_type: 'physical',
    meeting_link: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    meeting_id: '',
    member_id: '',
    status: 'Present'
  });

  useEffect(() => {
    fetchMeetings();
    fetchMembers();
  }, []);

  const fetchMeetings = () => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchMembers = () => {
    fetch(`${API_BASE}/members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.log('Backend offline'));
  };

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(meetingForm)
    })
      .then(res => res.json())
      .then(data => {
        alert('Meeting registered successfully!');
        setMeetingForm({title: '', date: '', time: '', venue: '', agenda: '', category: '', meeting_type: 'physical', meeting_link: ''});
        fetchMeetings();
      });
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(attendanceForm)
    })
      .then(res => res.json())
      .then(data => {
        alert('Attendance recorded!');
        setAttendanceForm({meeting_id: '', member_id: '', status: 'Present'});
      });
  };

  const sendMeetingNotification = (meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId);
    let locationInfo = '';
    
    if (meeting.meeting_type === 'online') {
      locationInfo = `Join online: ${meeting.meeting_link || meeting.venue}`;
    } else if (meeting.meeting_type === 'hybrid') {
      locationInfo = `Venue: ${meeting.venue}. Online: ${meeting.meeting_link}`;
    } else {
      locationInfo = `Venue: ${meeting.venue}`;
    }
    
    const message = `MEETING ALERT: ${meeting.title}\nDate: ${meeting.date} at ${meeting.time}\n${locationInfo}\nPlease confirm attendance.`;
    
    fetch(`${API_BASE}/send-bulk-sms`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        category: meeting.category,
        message: message
      })
    })
      .then(res => res.json())
      .then(data => alert(`Meeting notification sent to ${data.recipients} members!`));
  };
  
  const generateGoogleMeetLink = (meeting) => {
    const meetTitle = encodeURIComponent(meeting.title);
    const meetDate = meeting.date.replace(/-/g, '');
    const meetTime = meeting.time.replace(':', '');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${meetTitle}&dates=${meetDate}T${meetTime}00/${meetDate}T${meetTime}00&details=Meeting%20organized%20by%20Mbogo%20Foundation&location=Online%20Meeting`;
    
    window.open(googleCalendarUrl, '_blank');
    
    alert('Google Meet Integration:\n\n1. Google Calendar will open\n2. Add event to create a Meet link\n3. Copy Meet link and update meeting\n4. Share link with members');
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Data Capture System</h2>
      
      <nav style={{display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center'}}>
        <button 
          className={activeSection === 'meetings' ? 'nav-button' : ''}
          onClick={() => setActiveSection('meetings')}
          style={{padding: '10px 20px', borderRadius: '8px', background: activeSection === 'meetings' ? '#0A2463' : '#CCCCCC'}}
        >
          Meetings
        </button>
        <button 
          className={activeSection === 'attendance' ? 'nav-button' : ''}
          onClick={() => setActiveSection('attendance')}
          style={{padding: '10px 20px', borderRadius: '8px', background: activeSection === 'attendance' ? '#0A2463' : '#CCCCCC'}}
        >
          Attendance
        </button>
        <button 
          className={activeSection === 'upload' ? 'nav-button' : ''}
          onClick={() => setActiveSection('upload')}
          style={{padding: '10px 20px', borderRadius: '8px', background: activeSection === 'upload' ? '#0A2463' : '#CCCCCC'}}
        >
          Data Upload
        </button>
      </nav>

      {activeSection === 'meetings' && (
        <div>
          <h3 className="section-title">Register New Meeting</h3>
          <form onSubmit={handleMeetingSubmit} className="info-card">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <input 
                placeholder="Meeting Title"
                value={meetingForm.title}
                onChange={e => setMeetingForm({...meetingForm, title: e.target.value})}
                required
              />
              <select
                value={meetingForm.category}
                onChange={e => setMeetingForm({...meetingForm, category: e.target.value})}
                required
              >
                <option value="">Select Target Group</option>
                <option value="">All Members</option>
                <option value="Church Leader">Church Leaders</option>
                <option value="Pastor">Pastors</option>
                <option value="Village Elder">Village Elders</option>
                <option value="Agent">Agents</option>
              </select>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <input 
                type="date"
                value={meetingForm.date}
                onChange={e => setMeetingForm({...meetingForm, date: e.target.value})}
                required
              />
              <input 
                type="time"
                value={meetingForm.time}
                onChange={e => setMeetingForm({...meetingForm, time: e.target.value})}
                required
              />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px'}}>
              <select
                value={meetingForm.meeting_type}
                onChange={e => setMeetingForm({...meetingForm, meeting_type: e.target.value})}
                required
              >
                <option value="physical">Physical Meeting</option>
                <option value="online">Online Meeting</option>
                <option value="hybrid">Hybrid Meeting</option>
              </select>
              
              <input 
                placeholder={meetingForm.meeting_type === 'online' ? 'Google Meet Link or zoom Link' : 'Venue/Location'}
                value={meetingForm.meeting_type === 'online' ? meetingForm.meeting_link : meetingForm.venue}
                onChange={e => {
                  if (meetingForm.meeting_type === 'online') {
                    setMeetingForm({...meetingForm, meeting_link: e.target.value});
                  } else {
                    setMeetingForm({...meetingForm, venue: e.target.value});
                  }
                }}
                required
              />
            </div>
            
            {meetingForm.meeting_type === 'hybrid' && (
              <input 
                placeholder="Online Meeting Link (Google Meet/Zoom)"
                value={meetingForm.meeting_link}
                onChange={e => setMeetingForm({...meetingForm, meeting_link: e.target.value})}
              />
            )}
            
            <textarea 
              placeholder="Meeting Agenda (Optional)"
              value={meetingForm.agenda}
              onChange={e => setMeetingForm({...meetingForm, agenda: e.target.value})}
              rows="3"
            />
            
            {meetingForm.meeting_type === 'online' && (
              <div style={{padding: '15px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #0A2463'}}>
                <h4 style={{color: '#0A2463', margin: '0 0 10px 0'}}>Online Meeting Setup</h4>
                <p style={{margin: '0', fontSize: '14px', color: '#0A2463'}}>
                  • Create a Google Meet link or use Zoom<br/>
                  • Paste the meeting link above<br/>
                  • Members will receive the link via SMS
                </p>
              </div>
            )}
            
            <button type="submit">Register Meeting</button>
          </form>

          <h3 className="section-title">Registered Meetings</h3>
          {meetings.map(meeting => (
            <div key={meeting.id} className="faq-item">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <h4 style={{color: '#0A2463', marginBottom: '10px'}}>
                    {meeting.meeting_type === 'online' ? 'Online' : meeting.meeting_type === 'hybrid' ? 'Hybrid' : 'Physical'} {meeting.title}
                  </h4>
                  <p style={{color: '#0A2463'}}><strong>Agenda:</strong> {meeting.agenda}</p>
                  <p style={{color: '#0A2463'}}><strong>Date:</strong> {meeting.date} at {meeting.time}</p>
                  <p style={{color: '#0A2463'}}><strong>{meeting.meeting_type === 'online' ? 'Meeting Link' : 'Venue'}:</strong> 
                    {meeting.meeting_type === 'online' || meeting.meeting_link ? (
                      <a href={meeting.meeting_link || meeting.venue} target="_blank" rel="noopener noreferrer" 
                         style={{color: '#0A2463', textDecoration: 'underline', marginLeft: '5px'}}>
                        {meeting.meeting_type === 'online' ? 'Join Online Meeting' : meeting.venue}
                      </a>
                    ) : meeting.venue}
                  </p>
                  {meeting.meeting_type === 'hybrid' && meeting.meeting_link && (
                    <p style={{color: '#0A2463'}}><strong>Online Link:</strong> 
                      <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" 
                         style={{color: '#0A2463', textDecoration: 'underline', marginLeft: '5px'}}>
                        Join Online
                      </a>
                    </p>
                  )}
                  <p style={{color: '#0A2463'}}><strong>Target:</strong> {meeting.category || 'All Members'}</p>
                  {meeting.agenda && <p style={{color: '#0A2463'}}><strong>Agenda:</strong> {meeting.agenda}</p>}
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <button 
                    onClick={() => sendMeetingNotification(meeting.id)}
                    style={{fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap'}}
                  >
                    Send SMS
                  </button>
                  {(meeting.meeting_type === 'online' || meeting.meeting_link) && (
                    <button 
                      onClick={() => generateGoogleMeetLink(meeting)}
                      style={{fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap', background: '#0A2463'}}
                    >
                      Google Meet
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'attendance' && (
        <div>
          <h3 className="section-title">Record Attendance</h3>
          <form onSubmit={handleAttendanceSubmit} className="info-card">
            <select
              value={attendanceForm.meeting_id}
              onChange={e => setAttendanceForm({...attendanceForm, meeting_id: e.target.value})}
              required
            >
              <option value="">Select Meeting</option>
              {meetings.map(meeting => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title} - {meeting.date}
                </option>
              ))}
            </select>
            
            <select
              value={attendanceForm.member_id}
              onChange={e => setAttendanceForm({...attendanceForm, member_id: e.target.value})}
              required
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.category}
                </option>
              ))}
            </select>
            
            <select
              value={attendanceForm.status}
              onChange={e => setAttendanceForm({...attendanceForm, status: e.target.value})}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
            
            <button type="submit">Record Attendance</button>
          </form>
        </div>
      )}

      {activeSection === 'upload' && (
        <div>
          <h3 className="section-title">Data Upload & Management</h3>
          <div className="info-card">
            <h4 style={{color: '#0A2463'}}>Bulk Data Upload</h4>
            <p style={{color: '#0A2463'}}>Upload CSV files with member data, meeting records, or attendance sheets.</p>
            <input type="file" accept=".csv,.xlsx" style={{marginBottom: '15px'}} />
            <button>Upload Data</button>
            
            <hr style={{margin: '20px 0', borderColor: '#0A2463'}} />
            
            <h4 style={{color: '#0A2463'}}>Data Export</h4>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              <button>Export Members</button>
              <button>Export Meetings</button>
              <button>Export Attendance</button>
              <button>Generate Reports</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataCapture;

