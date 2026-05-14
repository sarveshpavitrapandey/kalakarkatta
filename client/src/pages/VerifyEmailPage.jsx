import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/feed.css';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
        localStorage.setItem('user', JSON.stringify(res.data));
        dispatch({ type: 'LOGIN', payload: res.data });
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/feed'), 2000);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Verification failed. Token may be invalid or expired.');
      }
    };
    verify();
  }, [token, dispatch, navigate]);

  return (
    <div className="feed-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div className="create-post-container">
        <h2>{message}</h2>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/login" className="text-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
