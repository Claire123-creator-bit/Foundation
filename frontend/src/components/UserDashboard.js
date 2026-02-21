import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchAnnouncements();
    fetchUpcomingMeetings();
    fetchAttendanceHistory();
  }, []);

  const fetchUserProfile = () => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userRole === 'member' && userId) {
      fetch(`${API_BASE}/member-profile`, {
        headers: {
          'Content-Type': 'application/json',
          'User-Role': userRole,
          'User-ID': userId
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUser({
              full_names: data.full_names || userName || 'Member',
              category: data.category || 'Member',
              ward: data.ward || 'Not provided',
              constituency: data.constituency || 'Not provided',
              is_verified: data.is_verified !== undefined ? data.is_verified : true,
              last_login: data.last_login || new Date().toISOString(),
              id: data.id || userId
            });
          } else {
            setUser({
              full_names: userName || 'Member',
              category: 'Member',
              ward: 'Not provided',
              constituency: 'Not provided',
              is_verified: true,
              last_login: new Date().toISOString(),
              id: userId
            });
          }
          setLoading(false);
        })
        .catch(() => {
          setUser({
            full_names: userName || 'Member',
            category: 'Member',
            ward: 'Not provided',
            constituency: 'Not provided',
            is_verified: true,
            last_login: new Date().toISOString(),
            id: userId
          });
          setLoading(false);
        });
    } else {
      setUser({
        full_names: userName || 'Admin',
        category: userRole === 'admin' ? 'Administrator' : 'Member',
        ward: 'N/A',
        constituency: 'N/A',
        is_verified: true,
        last_login: new Date().toISOString()
      });
      setLoading(false);
    }
  };

  const fetchAnnouncements = () => {
    fetch(`${API_BASE}/announcements`)
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(() => {});
  };

  const fetchUpcomingMeetings = () => {
    fetch(`${API_BASE}/meetings`)
      .then(res => res.json())
      .then(data => {
        const upcoming = data.filter(meeting => new Date(meeting.date) >= new Date());
        setUpcomingMeetings(upcoming.slice(0, 3));
      })
      .catch(() => {});
  };

  const fetchAttendanceHistory = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'member' && userId) {
      fetch(`${API_BASE}/attendance-records?member_id=${userId}`)
        .then(res => res.json())
        .then(data => setAttendanceHistory(data.slice(0, 5)))
        .catch(() => {});
    }
  };

  if (loading || !user) {
    return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '48px',
        minHeight: '400px'
      }}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div style={{
        background: '#D4735E',
        color: '#FAF7F5',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{margin: '0 0 8px 0', fontSize: '24px', color: '#FAF7F5'}}>
          Welcome back, {user.full_names.split(' ')[0]}!
        </h2>
        <p style={{margin: '0', fontSize: '14px', fontWeight: '300', color: '#FAF7F5'}}>
          {user.category} | {user.ward} Ward, {user.constituency} | 
          {user.is_verified ? ' Verified' : ' Pending Verification'}
        </p>
        <p style={{margin: '8px 0 0 0', fontSize: '12px', fontWeight: '300', color: '#FAF7F5'}}>
          Last login: {new Date(user.last_login).toLocaleDateString()}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 200px))',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '200px',
          height: '200px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px'}}>Messages</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#D4735E', margin: '8px 0'}}>
            {announcements.length}
          </p>
          <p style={{fontSize: '12px'}}>new announcements</p>
        </div>
        
        <div style={{
          width: '200px',
          height: '200px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px'}}>Meetings</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#D4735E', margin: '8px 0'}}>
            {upcomingMeetings.length}
          </p>
          <p style={{fontSize: '12px'}}>upcoming meetings</p>
        </div>
        
        <div style={{
          width: '200px',
          height: '200px',
          background: '#FFFFFF',
          border: '1px solid #D4735E',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px'}}>Attendance</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#D4735E', margin: '8px 0'}}>
            {attendanceHistory.length}
          </p>
          <p style={{fontSize: '12px'}}>meetings attended</p>
        </div>
      </div>

      <h3 className="section-title">Important Announcements</h3>
      {announcements.length > 0 ? (
        announcements.slice(0, 3).map((announcement, index) => (
          <div key={index} className="faq-item">
            <h4>{announcement.title}</h4>
            <p>{announcement.content}</p>
            <span style={{
              background: announcement.priority === 'high' ? '#D4735E' : '#FAF7F5',
              color: announcement.priority === 'high' ? '#FAF7F5' : '#2C2C2C',
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #D4735E'
            }}>
              {announcement.priority || 'normal'}
            </span>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', padding: '32px'}}>
          <p>No new announcements at this time.</p>
        </div>
      )}

      <h3 className="section-title">Upcoming Meetings</h3>
      {upcomingMeetings.length > 0 ? (
        upcomingMeetings.map(meeting => (
          <div key={meeting.id} className="faq-item">
            <h4>{meeting.title}</h4>
            <p>{meeting.date} at {meeting.time}</p>
            <p>{meeting.meeting_type === 'online' ? 'Online Meeting' : meeting.venue}</p>
            <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
              {meeting.meeting_link && (
                <button onClick={() => window.open(meeting.meeting_link, '_blank')}>
                  Join Meeting
                </button>
              )}
              <button style={{background: '#2C2C2C'}}>
                Sign In
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', padding: '32px'}}>
          <p>No upcoming meetings scheduled.</p>
        </div>
      )}

      <h3 className="section-title">Recent Attendance History</h3>
      {attendanceHistory.length > 0 ? (
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Meeting</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.meeting_title}</td>
                  <td>{record.meeting_date}</td>
                  <td>
                    <span style={{
                      background: record.status === 'Present' ? '#2C2C2C' : '#D4735E',
                      color: '#FAF7F5',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '32px'}}>
          <p>No attendance records yet.</p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
