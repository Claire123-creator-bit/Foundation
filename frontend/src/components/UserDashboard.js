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
      <div className="form-container">
        <p style={{color: '#0A2463'}}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div style={{
        background: '#0A2463',
        color: '#FFFFFF',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{margin: '0 0 8px 0', fontSize: '24px', color: '#FFFFFF'}}>
          Welcome back, {user.full_names.split(' ')[0]}!
        </h2>
        <p style={{margin: '0', fontSize: '14px', fontWeight: '300', color: '#FFFFFF'}}>
          {user.category} | {user.ward} Ward, {user.constituency} | 
          {user.is_verified ? ' Verified' : ' Pending Verification'}
        </p>
        <p style={{margin: '8px 0 0 0', fontSize: '12px', fontWeight: '300', color: '#FFFFFF'}}>
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
          border: '1px solid #0A2463',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px', color: '#0A2463'}}>Messages</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#0A2463', margin: '8px 0'}}>
            {announcements.length}
          </p>
          <p style={{fontSize: '12px', color: '#0A2463'}}>new announcements</p>
        </div>
        
        <div style={{
          width: '200px',
          height: '200px',
          background: '#FFFFFF',
          border: '1px solid #0A2463',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px', color: '#0A2463'}}>Meetings</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#0A2463', margin: '8px 0'}}>
            {upcomingMeetings.length}
          </p>
          <p style={{fontSize: '12px', color: '#0A2463'}}>upcoming meetings</p>
        </div>
        
        <div style={{
          width: '200px',
          height: '200px',
          background: '#FFFFFF',
          border: '1px solid #0A2463',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h4 style={{marginBottom: '8px', color: '#0A2463'}}>Attendance</h4>
          <p style={{fontSize: '32px', fontWeight: '700', color: '#0A2463', margin: '8px 0'}}>
            {attendanceHistory.length}
          </p>
          <p style={{fontSize: '12px', color: '#0A2463'}}>meetings attended</p>
        </div>
      </div>

      <h3 className="section-title">Important Announcements</h3>
      {announcements.length > 0 ? (
        announcements.slice(0, 3).map((announcement, index) => (
          <div key={index} className="faq-item">
            <h4 style={{color: '#0A2463'}}>{announcement.title}</h4>
            <p style={{color: '#0A2463'}}>{announcement.content}</p>
            <span style={{
              background: announcement.priority === 'high' ? '#0A2463' : '#FFFFFF',
              color: announcement.priority === 'high' ? '#FFFFFF' : '#0A2463',
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #0A2463'
            }}>
              {announcement.priority || 'normal'}
            </span>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', padding: '32px'}}>
          <p style={{color: '#0A2463'}}>No new announcements at this time.</p>
        </div>
      )}

      <h3 className="section-title">Upcoming Meetings</h3>
      {upcomingMeetings.length > 0 ? (
        upcomingMeetings.map(meeting => (
          <div key={meeting.id} className="faq-item">
            <h4 style={{color: '#0A2463'}}>{meeting.title}</h4>
            <p style={{color: '#0A2463'}}>{meeting.date} at {meeting.time}</p>
            <p style={{color: '#0A2463'}}>{meeting.meeting_type === 'online' ? 'Online Meeting' : meeting.venue}</p>
            <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
              {meeting.meeting_link && (
                <button onClick={() => window.open(meeting.meeting_link, '_blank')}>
                  Join Meeting
                </button>
              )}
              <button style={{background: '#0A2463'}}>
                Sign In
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', padding: '32px'}}>
          <p style={{color: '#0A2463'}}>No upcoming meetings scheduled.</p>
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
                  <td style={{color: '#0A2463'}}>{record.meeting_title}</td>
                  <td style={{color: '#0A2463'}}>{record.meeting_date}</td>
                  <td>
                    <span style={{
                      background: '#0A2463',
                      color: '#FFFFFF',
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
          <p style={{color: '#0A2463'}}>No attendance records yet.</p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

