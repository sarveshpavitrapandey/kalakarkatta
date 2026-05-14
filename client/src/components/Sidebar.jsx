import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: 'LOGOUT' });
    closeSidebar();
    navigate('/');
  };

  const menuItems = [
    { title: 'My Content', items: [
      { to: '/my-events', icon: '🎟️', label: 'My Events' },
      { to: '/my-jobs', icon: '💼', label: 'Jobs Created' },
      { to: '/my-applications', icon: '📝', label: 'Applied for Jobs' },
      { to: '/collaborators', icon: '🤝', label: 'Collaborators' },
    ]},
    { title: 'Discover', items: [
      { to: '/community', icon: '🌍', label: 'Community' },
      { to: '/events', icon: '🎫', label: 'Explore Events' },
      { to: '/jobs', icon: '🎯', label: 'Find Jobs' },
    ]}
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1040]"
            onClick={closeSidebar}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-[320px] h-screen bg-background/95 backdrop-blur-xl border-r border-border z-[1050] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="m-0 text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Menu
              </h2>
              <button 
                onClick={closeSidebar} 
                className="bg-transparent border-none text-textMuted hover:text-text text-2xl cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {menuItems.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <h3 className="text-xs uppercase tracking-wider text-textMuted font-bold mb-1">{group.title}</h3>
                  <nav className="flex flex-col gap-1">
                    {group.items.map(item => {
                      const isActive = location.pathname === item.to;
                      return (
                        <Link 
                          key={item.to} 
                          to={item.to} 
                          onClick={closeSidebar} 
                          className={`flex items-center gap-3 py-3 px-4 rounded-xl text-[0.95rem] font-medium transition ${
                            isActive 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'text-text hover:bg-surface border border-transparent'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}

              {/* Logout */}
              <div className="mt-auto pt-6 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl text-[0.95rem] font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🚪</span> Logout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
