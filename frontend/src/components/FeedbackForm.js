import React, { useState } from 'react';

function FeedbackForm({ meetingId }) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      console.log('Feedback submitted for meeting', meetingId, ':', feedback);
      setSubmitted(true);
      setFeedback('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div style={{ marginTop: '10px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#00bcd4', fontSize: '14px' }}>Give Feedback</h4>
      {submitted ? (
        <p style={{ color: '#4caf50', margin: 0 }}>Thank you for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about this meeting..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '60px',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: '#00bcd4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}

export default FeedbackForm;

