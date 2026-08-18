const API_BASE = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://foundation-2.onrender.com'
    : 'http://localhost:8080');

export default API_BASE;
