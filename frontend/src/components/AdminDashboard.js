import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/auth';

function AdminDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMessage, setTrainingMessage] = useState('Not started');
  const [metrics, setMetrics] = useState({ rf: null, lstm: null });
  const [isTraining, setIsTraining] = useState(false);

  const fetchAssignments = () => {
    fetch('https://foundation-0x4i.onrender.com/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.log('Backend offline'));
  };

  const fetchMetrics = () => {
    fetch('https://foundation-0x4i.onrender.com/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.log('Error fetching metrics'));
  };

  const fetchProgress = useCallback(() => {
    fetch('https://foundation-0x4i.onrender.com/api/progress')
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
    fetch('https://foundation-0x4i.onrender.com/assignments', {
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
    fetch(`https://foundation-0x4i.onrender.com/assignments/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status})
    }).then(() => fetchAssignments());
  };

  const startTraining = () => {
    const token = getAuthToken();
    fetch('https://foundation-0x4i.onrender.com/api/train', {
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
