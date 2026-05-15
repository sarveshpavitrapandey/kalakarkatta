import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data });
      navigate('/profile');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-main flex justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface/60 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-primary/30 mx-auto mb-4">
            <span className="font-bold">♪</span>
          </div>
          <h2 className="text-3xl font-extrabold text-text m-0 mb-2">Welcome Back</h2>
          <p className="text-textMuted text-sm m-0">Sign in to continue to KalakarKatta</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-textMuted mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-inner"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
              <label className="block text-sm font-semibold text-textMuted">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-white transition no-underline font-medium">Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-inner"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold text-lg rounded-xl py-3.5 mt-2 hover:shadow-lg hover:shadow-primary/40 transition disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-sm text-center mt-5 mb-0"
          >
            {message}
          </motion.p>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-sm text-textMuted m-0">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:text-white transition no-underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
