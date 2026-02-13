import React, { useState, useEffect } from 'react';
import API_BASE from '../utils/apiConfig';

function PollList() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/polls`)
      .then(res => res.json())
      .then(data => setPolls(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPoll && response) {
      fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: selectedPoll.id, response })
      })
        .then(res => res.json())
        .then(data => {
          alert('Feedback submitted!');
          setResponse('');
          setSelectedPoll(null);
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <h2>Opinion Polls</h2>
      {polls.map(poll => (
        <div key={poll.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>{poll.title}</h3>
          <p>{poll.question}</p>
          <ul>
            {poll.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
          <button onClick={() => setSelectedPoll(poll)}>Respond</button>
        </div>
      ))}
      {selectedPoll && (
        <form onSubmit={handleSubmit}>
          <h3>Respond to: {selectedPoll.title}</h3>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Your response"
            required
          />
          <button type="submit">Submit</button>
          <button type="button" onClick={() => setSelectedPoll(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default PollList;
