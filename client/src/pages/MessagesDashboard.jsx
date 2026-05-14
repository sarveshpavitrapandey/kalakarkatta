import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MessagesDashboard() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-extrabold text-text">Messages</h1>
          <p className="text-textMuted">Connect with collaborators and friends</p>
        </div>

        {loading ? (
          <p className="text-center text-textMuted">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="text-center mt-16 text-textMuted">
            <span className="text-5xl mb-4 block">💬</span>
            <h2 className="text-xl">No active conversations</h2>
            <Link to="/community" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 no-underline transition">
              Find Artists
            </Link>
          </div>
        ) : (
          <motion.div 
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== (loggedUser.user?._id || loggedUser._id));
              if (!otherUser) return null;

              return (
                <motion.div key={conv._id} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                  <Link 
                    to={`/messages/${otherUser._id}`}
                    className="flex items-center gap-4 bg-surface/50 border border-border p-4 rounded-2xl hover:bg-surface transition no-underline text-text"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
                          {otherUser.profilePicture ? (
                            <img src={otherUser.profilePicture} alt={otherUser.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold">{otherUser.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      {/* Active Status Dot */}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-0.5">{otherUser.name}</h3>
                      <p className="text-sm text-textMuted m-0">@{otherUser.username}</p>
                    </div>
                    
                    <div className="text-primary text-2xl font-bold opacity-0 group-hover:opacity-100 transition">
                      ›
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
