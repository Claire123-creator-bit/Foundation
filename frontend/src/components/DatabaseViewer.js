import React, { useState, useEffect } from 'react';

function DatabaseViewer() {
  const [activeTable, setActiveTable] = useState('members');
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchMembers();
    fetchMeetings();
    fetchAttendance();
  }, []);

  const fetchMembers = () => {
    fetch('http://localhost:5000/members')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchMeetings = () => {
    fetch('http://localhost:5000/meetings')
      .then(res => res.json())
      .then(data => setMeetings(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchAttendance = () => {
    fetch('http://localhost:5000/attendance-records')
      .then(res => res.json())
      .then(data => setAttendance(data))
      .catch(err => console.log('Backend offline'));
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,188,212,0.1)'
  };

  const thStyle = {
    background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
    color: 'white',
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const tdStyle = {
    padding: '10px 8px',
    borderBottom: '1px solid #eee',
    fontSize: '13px'
  };

  return (
    <div className="form-container">
      <h2 className="page-title">🗄️ Database Tables</h2>
      
      <nav style={{display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center'}}>
        <button 
          onClick={() => setActiveTable('members')}
          style={{
            padding: '10px 20px', 
            borderRadius: '8px', 
            background: activeTable === 'members' ? '#00bcd4' : '#f0f0f0',
            color: activeTable === 'members' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          👥 Members ({members.length})
        </button>
        <button 
          onClick={() => setActiveTable('meetings')}
          style={{
            padding: '10px 20px', 
            borderRadius: '8px', 
            background: activeTable === 'meetings' ? '#00bcd4' : '#f0f0f0',
            color: activeTable === 'meetings' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📅 Meetings ({meetings.length})
        </button>
        <button 
          onClick={() => setActiveTable('attendance')}
          style={{
            padding: '10px 20px', 
            borderRadius: '8px', 
            background: activeTable === 'attendance' ? '#00bcd4' : '#f0f0f0',
            color: activeTable === 'attendance' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ✅ Attendance ({attendance.length})
        </button>
      </nav>

      {activeTable === 'members' && (
        <div>
          <h3 style={{color: '#00bcd4'}}>👥 Members Table</h3>
          {members.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>ID Number</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>County</th>
                  <th style={thStyle}>Constituency</th>
                  <th style={thStyle}>Ward</th>
                  <th style={thStyle}>Polling Centre</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} style={{background: member.id % 2 === 0 ? '#f9f9f9' : 'white'}}>
                    <td style={tdStyle}>{member.id}</td>
                    <td style={tdStyle}><strong>{member.name}</strong></td>
                    <td style={tdStyle}>{member.id_no}</td>
                    <td style={tdStyle}>{member.phone}</td>
                    <td style={tdStyle}>{member.county}</td>
                    <td style={tdStyle}>{member.constituency}</td>
                    <td style={tdStyle}>{member.ward}</td>
                    <td style={tdStyle}>{member.polling_centre}</td>
                    <td style={tdStyle}><span style={{background: '#00bcd4', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px'}}>{member.category}</span></td>
                    <td style={tdStyle}>{new Date(member.registration_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No members registered yet. Go to "Join Us" to add members.</p>
            </div>
          )}
        </div>
      )}

      {activeTable === 'meetings' && (
        <div>
          <h3 style={{color: '#00bcd4'}}>📅 Meetings Table</h3>
          {meetings.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Venue/Link</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map(meeting => (
                  <tr key={meeting.id} style={{background: meeting.id % 2 === 0 ? '#f9f9f9' : 'white'}}>
                    <td style={tdStyle}>{meeting.id}</td>
                    <td style={tdStyle}><strong>{meeting.title}</strong></td>
                    <td style={tdStyle}>{meeting.date}</td>
                    <td style={tdStyle}>{meeting.time}</td>
                    <td style={tdStyle}>
                      <span style={{background: meeting.meeting_type === 'online' ? '#4285f4' : '#00bcd4', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px'}}>
                        {meeting.meeting_type || 'physical'}
                      </span>
                    </td>
                    <td style={tdStyle}>{meeting.meeting_link || meeting.venue}</td>
                    <td style={tdStyle}>{meeting.category || 'All'}</td>
                    <td style={tdStyle}>{new Date(meeting.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No meetings created yet. Go to "Data Capture" to add meetings.</p>
            </div>
          )}
        </div>
      )}

      {activeTable === 'attendance' && (
        <div>
          <h3 style={{color: '#00bcd4'}}>✅ Attendance Table</h3>
          {attendance.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Meeting</th>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record.id} style={{background: record.id % 2 === 0 ? '#f9f9f9' : 'white'}}>
                    <td style={tdStyle}>{record.id}</td>
                    <td style={tdStyle}>{record.meeting_title}</td>
                    <td style={tdStyle}>{record.member_name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: record.status === 'Present' ? '#4caf50' : record.status === 'Late' ? '#ff9800' : '#f44336',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(record.recorded_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No attendance records yet. Go to "Data Capture" → "Attendance" to record attendance.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatabaseViewer;