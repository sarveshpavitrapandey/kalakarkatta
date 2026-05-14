import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data });
      navigate('/profile');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-main flex justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-surface/60 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-2xl relative z-10 my-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-primary/30 mx-auto mb-4">
            <span className="font-bold">✦</span>
          </div>
          <h2 className="text-3xl font-extrabold text-text m-0 mb-2">Join KalakarKatta</h2>
          <p className="text-textMuted text-sm m-0">Create an account to showcase your art</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-textMuted mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="John Doe" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-inner"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-textMuted mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-textMuted mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-inner"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold text-lg rounded-xl py-3.5 mt-2 hover:shadow-lg hover:shadow-primary/40 transition disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:text-white transition no-underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
