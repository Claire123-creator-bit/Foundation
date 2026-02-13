import React, { useState, useEffect } from 'react';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    profile: true,
    announcements: true,
    meetings: true,
    attendance: true
  });

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
      const headers = {
        'Content-Type': 'application/json',
        'User-Role': userRole,
        'User-ID': userId
      };
      
      fetch('https://foundation-0x4i.onrender.com/members', { headers })
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const memberData = data[0];
            setUser({
              ...memberData,
              last_login: new Date().toISOString()
            });
          }
          setDataLoading(prev => ({ ...prev, profile: false }));
        })
        .catch(err => {
          console.log('Backend offline');
          setUser({
            full_names: userName || 'Member',
            category: 'Member',
            ward: 'N/A',
            constituency: 'N/A',
            is_verified: true,
            last_login: new Date().toISOString()
          });
          setDataLoading(prev => ({ ...prev, profile: false }));
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
      setDataLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchAnnouncements = () => {
    fetch('https://foundation-0x4i.onrender.com/announcements')
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data);
        setDataLoading(prev => ({ ...prev, announcements: false }));
      })
      .catch(err => {
        console.log('Backend offline');
        setDataLoading(prev => ({ ...prev, announcements: false }));
      });
  };

  const fetchUpcomingMeetings = () => {
    fetch('https://foundation-0x4i.onrender.com/meetings')
      .then(res => res.json())
      .then(data => {
        const upcoming = data.filter(meeting => new Date(meeting.date) >= new Date());
        setUpcomingMeetings(upcoming.slice(0, 3));
        setDataLoading(prev => ({ ...prev, meetings: false }));
      })
      .catch(err => {
        console.log('Backend offline');
        setDataLoading(prev => ({ ...prev, meetings: false }));
      });
  };

  const fetchAttendanceHistory = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'member' && userId) {
      fetch(`https://foundation-0x4i.onrender.com/attendance-records?member_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          setAttendanceHistory(data.slice(0, 5));
          setDataLoading(prev => ({ ...prev, attendance: false }));
        })
        .catch(err => {
          console.log('Backend offline');
          setAttendanceHistory([]);
          setDataLoading(prev => ({ ...prev, attendance: false }));
        });
    } else {
      setAttendanceHistory([]);
      setDataLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Check if all data is loaded
  useEffect(() => {
    const allLoaded = Object.values(dataLoading).every(v => v === false);
    if (allLoaded !== loading) {
      setLoading(allLoaded);
    }
  }, [dataLoading]);

  const joinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
      alert('Please sign in to confirm your attendance once you join the meeting.');
    }
  };

  const signInToMeeting = (meetingId) => {
    fetch('https://foundation-0x4i.onrender.com/sign-in-meeting', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({meeting_id: meetingId, user_id: user.id})
    })
      .then(res => res.json())
      .then(data => {
        alert('Attendance confirmed! You have been marked as Present.');
        fetchAttendanceHistory();
      })
      .catch(err => alert('Sign-in failed. Please try again.'));
  };

  // Show loading spinner while loading OR if user is not yet set
  if (loading || !user) {
    return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '50px',
        minHeight: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #00bcd4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{marginTop: '20px', color: '#666', fontSize: '16px'}}>Loading your dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div style={{
        background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{margin: '0 0 10px 0', fontSize: '1.8em'}}>
          Welcome back, {user.full_names.split(' ')[0]}!
        </h2>
        <p style={{margin: '0', opacity: '0.9'}}>
          {user.category} | {user.ward} Ward, {user.constituency} | 
          {user.is_verified ? ' Verified' : ' Pending Verification'}
        </p>
        <p style={{margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8'}}>
          Last login: {new Date(user.last_login).toLocaleDateString()}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="info-card" style={{textAlign: 'center', padding: '20px'}}>
          <h4 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>Messages</h4>
          <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
            {announcements.length} new announcements
          </p>
        </div>
        
        <div className="info-card" style={{textAlign: 'center', padding: '20px'}}>
          <h4 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>Meetings</h4>
          <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
            {upcomingMeetings.length} upcoming meetings
          </p>
        </div>
        
        <div className="info-card" style={{textAlign: 'center', padding: '20px'}}>
          <h4 style={{color: '#00bcd4', margin: '0 0 10px 0'}}>Attendance</h4>
          <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
            {attendanceHistory.length} meetings attended
          </p>
        </div>
      </div>

      <div style={{marginBottom: '30px'}}>
        <h3 className="section-title">Important Announcements</h3>
        {announcements.length > 0 ? (
          announcements.slice(0, 3).map((announcement, index) => (
            <div key={index} className="faq-item" style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <h4 style={{color: '#00bcd4', margin: '0 0 8px 0'}}>{announcement.title}</h4>
                  <p style={{margin: '0', fontSize: '14px', lineHeight: '1.5'}}>{announcement.content}</p>
                </div>
                <span style={{
                  background: announcement.priority === 'high' ? '#f44336' : '#ff9800',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  marginLeft: '10px'
                }}>
                  {announcement.priority || 'normal'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '30px', color: '#666'}}>
            <p>No new announcements at this time.</p>
          </div>
        )}
      </div>

      <div style={{marginBottom: '30px'}}>
        <h3 className="section-title">Upcoming Meetings</h3>
        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map(meeting => (
            <div key={meeting.id} className="faq-item" style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                  <h4 style={{color: '#00bcd4', margin: '0 0 8px 0'}}>
                    {meeting.title}
                  </h4>
                  <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
                    {meeting.date} at {meeting.time}
                  </p>
                  <p style={{margin: '5px 0 0 0', fontSize: '14px', color: '#666'}}>
                    {meeting.meeting_type === 'online' ? 'Online Meeting' : meeting.venue}
                  </p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {meeting.meeting_link && (
                    <button 
                      onClick={() => joinMeeting(meeting.meeting_link)}
                      style={{fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap'}}
                    >
                      Join Meeting
                    </button>
                  )}
                  <button 
                    onClick={() => signInToMeeting(meeting.id)}
                    style={{fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap', background: '#4caf50'}}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '30px', color: '#666'}}>
            <p>No upcoming meetings scheduled.</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="section-title">Recent Attendance History</h3>
        {attendanceHistory.length > 0 ? (
          <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,188,212,0.1)'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: 'linear-gradient(45deg, #00bcd4, #0097a7)'}}>
                  <th style={{color: 'white', padding: '12px 8px', textAlign: 'left', fontSize: '14px'}}>Meeting</th>
                  <th style={{color: 'white', padding: '12px 8px', textAlign: 'left', fontSize: '14px'}}>Date</th>
                  <th style={{color: 'white', padding: '12px 8px', textAlign: 'left', fontSize: '14px'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record, index) => (
                  <tr key={index} style={{background: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                    <td style={{padding: '10px 8px', fontSize: '13px'}}>{record.meeting_title}</td>
                    <td style={{padding: '10px 8px', fontSize: '13px'}}>{record.meeting_date}</td>
                    <td style={{padding: '10px 8px', fontSize: '13px'}}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '30px', color: '#666'}}>
            <p>No attendance records yet. Join meetings to build your history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

