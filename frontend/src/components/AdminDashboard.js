import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/auth';
import API_BASE from '../utils/apiConfig';

function AdminDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMessage, setTrainingMessage] = useState('Not started');
  const [metrics, setMetrics] = useState({ rf: null, lstm: null });
  const [isTraining, setIsTraining] = useState(false);
  const [memberStats, setMemberStats] = useState({ total: 0, categories: [] });
  const [userRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [userId] = useState(localStorage.getItem('userId') || '');

  const fetchMemberStats = () => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Role': userRole,
      'User-ID': userId
    };
    
    fetch(`${API_BASE}/members`, { headers })
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
      .catch(err => console.log('Error fetching member stats'));
  };

  const fetchAssignments = () => {
    fetch(`${API_BASE}/assignments`)
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchMetrics = () => {
    fetch(`${API_BASE}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.log('Error fetching metrics'));
  };

  const fetchProgress = useCallback(() => {
    fetch(`${API_BASE}/api/progress`)
      .then(res => res.json())
      .then(data => {
        setTrainingProgress(data.progress);
        setTrainingMessage(data.message);
        if (data.progress === 100) {
          setIsTraining(false);
          fetchMetrics();
        }
      })
      .catch(err => console.log('Error fetching progress'));
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchMetrics();
    fetchMemberStats();
  }, []);

  useEffect(() => {
    let interval;
    if (isTraining) {
      interval = setInterval(fetchProgress, 1000);
    }
    return () => clearInterval(interval);
  }, [isTraining, fetchProgress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newAssignment)
    })
      .then(res => res.json())
      .then(() => {
        fetchAssignments();
        setNewAssignment({title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''});
      });
  };

  const updateStatus = (id, status) => {
    fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status})
    }).then(() => fetchAssignments());
  };

  const startTraining = () => {
    const token = getAuthToken();
    fetch(`${API_BASE}/api/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(() => {
        setIsTraining(true);
        setTrainingProgress(0);
        setTrainingMessage('Starting training...');
      })
      .catch(err => console.log('Error starting training'));
  };

  return (
    <div className="form-container">
      <h2 className="page-title">Office Administration</h2>
      
      {/* Member Statistics Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="info-card" style={{
          background: 'linear-gradient(135deg, #006064 0%, #00838f 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9}}>Total Members</h3>
          <p style={{margin: 0, fontSize: '48px', fontWeight: 'bold'}}>{memberStats.total}</p>
        </div>
        
        {memberStats.categories.slice(0, 3).map((cat, index) => (
          <div key={index} className="info-card" style={{
            background: index === 0 ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' :
                       index === 1 ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                       'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>{cat.name}</h3>
            <p style={{margin: 0, fontSize: '36px', fontWeight: 'bold'}}>{cat.count}</p>
          </div>
        ))}
      </div>
      
      {memberStats.categories.length > 0 && (
        <div style={{marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '10px'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Member Categories Breakdown:</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
            {memberStats.categories.map((cat, index) => (
              <span key={index} style={{
                background: 'white',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#333',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {cat.name}: <strong>{cat.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="info-card" style={{marginBottom: '30px'}}>
        <h3 className="section-title">Create Assignment</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
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
          style={{marginBottom: '15px'}}
        />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
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

      <div>
        <h3 className="section-title">Assignments</h3>
        {assignments.map(assignment => (
          <div key={assignment.id} className="faq-item" style={{marginBottom: '20px'}}>
            <h4 style={{color: '#00bcd4', marginBottom: '10px'}}>{assignment.title}</h4>
            <p style={{marginBottom: '10px'}}>{assignment.description}</p>
            <div style={{display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '14px', color: '#666'}}>
              <span><strong>Assigned to:</strong> {assignment.assigned_to}</span>
              <span><strong>Priority:</strong> {assignment.priority}</span>
              <span><strong>Status:</strong> {assignment.status}</span>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => updateStatus(assignment.id, 'In Progress')} style={{fontSize: '12px', padding: '8px 16px'}}>Start</button>
              <button onClick={() => updateStatus(assignment.id, 'Completed')} style={{fontSize: '12px', padding: '8px 16px'}}>Complete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="info-card" style={{marginTop: '30px'}}>
        <h3 className="section-title">Model Training</h3>
        <button onClick={startTraining} disabled={isTraining} style={{marginBottom: '20px'}}>Train Models</button>
        {isTraining && (
          <div style={{marginBottom: '20px'}}>
            <div style={{width: '100%', backgroundColor: '#f3f3f3', borderRadius: '5px', height: '20px'}}>
              <div style={{width: `${trainingProgress}%`, backgroundColor: '#00bcd4', height: '20px', borderRadius: '5px'}}></div>
            </div>
            <p style={{marginTop: '10px'}}>{trainingMessage}</p>
          </div>
        )}
        <div>
          <h4>Random Forest Metrics</h4>
          {metrics.rf ? (
            <ul>
              <li>Accuracy: {metrics.rf.accuracy?.toFixed(2)}</li>
              <li>Precision: {metrics.rf.precision?.toFixed(2)}</li>
              <li>Recall: {metrics.rf.recall?.toFixed(2)}</li>
              <li>F1 Score: {metrics.rf.f1_score?.toFixed(2)}</li>
            </ul>
          ) : <p>No data</p>}
        </div>
        <div>
          <h4>LSTM Metrics</h4>
          {metrics.lstm ? (
            <ul>
              <li>MSE: {metrics.lstm.mse?.toFixed(2)}</li>
              <li>MAE: {metrics.lstm.mae?.toFixed(2)}</li>
            </ul>
          ) : <p>No data</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
