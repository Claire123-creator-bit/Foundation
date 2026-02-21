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
    <div style={{ marginTop: '10px', padding: '15px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #0A2463' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#0A2463', fontSize: '14px' }}>Give Feedback</h4>
      {submitted ? (
        <p style={{ color: '#0A2463', margin: 0 }}>Thank you for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about this meeting..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #0A2463',
              borderRadius: '4px',
              minHeight: '60px',
              fontSize: '13px',
              resize: 'vertical',
              background: '#FFFFFF',
              color: '#0A2463'
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: '#0A2463',
              color: '#FFFFFF',
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

