import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export default function VerificationSentPage() {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-main flex justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-surface/60 backdrop-blur-2xl border border-border rounded-[2.5rem] p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl mx-auto mb-8 shadow-inner">
          <span className="animate-bounce">📧</span>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Verify Your Email</h2>
        <p className="text-textMuted leading-relaxed mb-8">
          We've sent a verification link to <span className="text-primary font-bold">{email}</span>. 
          Please check your inbox and click the link to activate your account.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-textMuted italic">
            Don't see the email? Check your spam folder or wait a few minutes.
          </div>
          
          <Link 
            to="/login" 
            className="block w-full bg-primary text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition no-underline shadow-xl"
          >
            Back to Login
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50">
          <p className="text-sm text-textMuted m-0">
            Entered the wrong email?{' '}
            <Link to="/signup" className="text-primary font-bold hover:text-white transition no-underline">
              Sign Up again
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
