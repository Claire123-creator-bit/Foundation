import React, { useState } from 'react';

function CheckIn({ meetingId }) {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5001/meetings/${meetingId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setCheckedIn(true);
      })
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={checkedIn}
      style={{
        padding: '10px 15px',
        background: checkedIn ? '#4caf50' : '#ff9800',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: checkedIn ? 'not-allowed' : 'pointer'
      }}
    >
      {checkedIn ? 'Checked In' : 'Check In'}
    </button>
  );
}

export default CheckIn;
