import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/feed.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Check your email for a password reset link.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email');
      setMessage('');
    }
  };

  return (
    <div className="feed-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="create-post-container" style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="create-post-form">
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ padding: '0.8rem', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <button type="submit" className="btn btn-hire" style={{ padding: '1rem', marginTop: '1rem', background: 'var(--color-primary)', color: 'white' }}>Send Reset Link</button>
        </form>
        {message && <p style={{ color: '#00C9FF', marginTop: '1rem', textAlign: 'center' }}>{message}</p>}
        {error && <p style={{ color: '#ff4b2b', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" className="text-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
