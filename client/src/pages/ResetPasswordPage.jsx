import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../styles/feed.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, { password });
      localStorage.setItem('user', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data });
      setMessage('Password reset successful! Redirecting...');
      setTimeout(() => navigate('/feed'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
      setMessage('');
    }
  };

  return (
    <div className="feed-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="create-post-container" style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit} className="create-post-form">
          <input 
            type="password" 
            placeholder="Enter your new password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ padding: '0.8rem', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          {password && (
            <div style={{ marginTop: '0.5rem', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>STRENGTH</span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: password.length < 6 ? '#f87171' : password.length < 10 ? '#fbbf24' : '#34d399' }}>
                  {password.length < 6 ? 'WEAK' : password.length < 10 ? 'FAIR' : 'STRONG'}
                </span>
              </div>
              <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min((password.length / 12) * 100, 100)}%`,
                    backgroundColor: password.length < 6 ? '#f87171' : password.length < 10 ? '#fbbf24' : '#34d399'
                  }}
                  style={{ height: '100%' }}
                />
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-hire" style={{ padding: '1rem', marginTop: '1rem', background: 'var(--color-primary)', color: 'white' }}>Reset Password</button>
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
