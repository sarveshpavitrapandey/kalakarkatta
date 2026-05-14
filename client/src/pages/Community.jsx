import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Community() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    fetchUsers(initialSearch);
  }, [initialSearch]);

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/users?search=${encodeURIComponent(query)}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-main pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header & Search */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-4">
            Discover Artists
          </h1>
          <p className="text-textMuted mb-8">Find collaborators, friends, and inspiration</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input 
              type="text" 
              placeholder="Search by name, username, or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition"
            />
            <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-center text-textMuted mt-10">Loading artists...</p>
        ) : users.length === 0 ? (
          <div className="text-center mt-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-xl text-textMuted">No artists found</h2>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {users.map(user => (
              <motion.div 
                key={user._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-surface/50 border border-border rounded-2xl p-6 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl transition duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{user.name?.charAt(0) || user.username?.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Link to={`/profile/${user._id}`} className="font-bold text-lg hover:text-primary transition no-underline text-text block">
                      {user.name || user.username}
                    </Link>
                    <span className="text-textMuted text-sm">@{user.username}</span>
                  </div>
                </div>

                <p className="text-sm text-textMuted line-clamp-2 mb-4 h-10">
                  {user.bio || 'No bio provided yet.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {user.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md border border-primary/20">
                      {skill}
                    </span>
                  ))}
                  {user.skills?.length > 3 && (
                    <span className="text-xs px-2 py-1 text-textMuted">+{user.skills.length - 3}</span>
                  )}
                </div>

                <Link to={`/profile/${user._id}`} className="block text-center w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition no-underline text-text">
                  View Profile
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
