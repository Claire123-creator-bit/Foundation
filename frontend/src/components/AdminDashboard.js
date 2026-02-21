import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/auth';
import API_BASE from '../utils/apiConfig';

function AdminDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''
  });
  const [memberStats, setMemberStats] = useState({ total: 0, categories: [] });
  const [userRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [userId] = useState(localStorage.getItem('userId') || '');

  const fetchMemberStats = () => {
    fetch(`${API_BASE}/members`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Role': userRole,
        'User-ID': userId
      }
    })
      .then(res => res.json())
      .then(data => {
        const categories = {};
        data.forEach(member => {
          const cat = member.category || 'Unknown';
          categories[cat] = (categories[cat] || 0) + 1;
        });
        setMemberStats({
          total: data.length,
          categories: Object.entries(categories).map(([name, count]) => ({ name, count }))
        });
      })
      .catch(() => {});
  };

  const fetchAssignments = () => {
    fetch(`${API_BASE}/assignments`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Role': 'admin'
      }
    })
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAssignments();
    fetchMemberStats();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Role': 'admin'
      },
      body: JSON.stringify(newAssignment)
    })
      .then(res => res.json())
      .then(() => {
        fetchAssignments();
        setNewAssignment({title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''});
      })
      .catch(() => {});
  };

  const updateStatus = (id, status) => {
    fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'User-Role': 'admin'
      },
      body: JSON.stringify({status})
    })
      .then(() => fetchAssignments())
      .catch(() => {});
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Office Administration</h2>
      
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
          background: '#D4735E',
          color: '#FAF7F5',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h3 style={{fontSize: '14px', marginBottom: '8px', fontWeight: '600', color: '#FAF7F5'}}>Total Members</h3>
          <p style={{fontSize: '48px', fontWeight: '700', margin: '0', color: '#FAF7F5'}}>{memberStats.total}</p>
        </div>
        
        {memberStats.categories.slice(0, 3).map((cat, index) => (
          <div key={index} style={{
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
            <h3 style={{fontSize: '14px', marginBottom: '8px', fontWeight: '600'}}>{cat.name}</h3>
            <p style={{fontSize: '36px', fontWeight: '700', margin: '0', color: '#D4735E'}}>{cat.count}</p>
          </div>
        ))}
      </div>
      
      {memberStats.categories.length > 0 && (
        <div className="info-card" style={{marginBottom: '32px'}}>
          <h4 style={{marginBottom: '16px'}}>Member Categories Breakdown:</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {memberStats.categories.map((cat, index) => (
              <span key={index} style={{
                background: '#FAF7F5',
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #D4735E'
              }}>
                {cat.name}: <strong>{cat.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="info-card" style={{marginBottom: '32px'}}>
        <h3 className="section-title">Create Assignment</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
          <input 
            placeholder="Assignment Title" 
            value={newAssignment.title}
            onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
            required 
          />
          <input 
            placeholder="Assigned To"
            value={newAssignment.assigned_to}
            onChange={e => setNewAssignment({...newAssignment, assigned_to: e.target.value})}
          />
        </div>
        <textarea 
          placeholder="Description"
          value={newAssignment.description}
          onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
          style={{marginBottom: '16px'}}
        />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
          <select 
            value={newAssignment.priority}
            onChange={e => setNewAssignment({...newAssignment, priority: e.target.value})}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <input 
            type="date"
            value={newAssignment.due_date}
            onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})}
          />
        </div>
        <button type="submit">Create Assignment</button>
      </form>

      <h3 className="section-title">Assignments</h3>
      {assignments.map(assignment => (
        <div key={assignment.id} className="faq-item">
          <h4>{assignment.title}</h4>
          <p>{assignment.description}</p>
          <div style={{display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '14px'}}>
            <span><strong>Assigned to:</strong> {assignment.assigned_to}</span>
            <span><strong>Priority:</strong> {assignment.priority}</span>
            <span><strong>Status:</strong> {assignment.status}</span>
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <button onClick={() => updateStatus(assignment.id, 'In Progress')}>Start</button>
            <button onClick={() => updateStatus(assignment.id, 'Completed')} style={{background: '#2C2C2C'}}>Complete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
