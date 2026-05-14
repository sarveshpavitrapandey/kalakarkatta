import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const { user: loggedUser, socket } = useContext(AuthContext);

  const emojis = ['❤️', '🔥', '👏', '🎨', '🌟', '🙌', '💯', '✨'];
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (loggedUser) {
      // Load following list
      const loadUser = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${loggedUser.user?._id || loggedUser._id}`);
          setFollowing(res.data.user.following || []);
        } catch(err) { console.error(err); }
      };
      loadUser();
    }

    fetchPosts();
  }, [loggedUser]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (authorId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${authorId}/follow`, {}, {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      
      setFollowing(prev => {
        if (prev.includes(authorId)) return prev.filter(id => id !== authorId);
        return [...prev, authorId];
      });
      
      // Optional: re-fetch posts to reorder, or just let state update UI
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    
    try {
      const token = loggedUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) return alert("Please login to comment");

      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local post state with new comments array
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data } : p));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to post comment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main pt-6 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        
        {loading ? (
          <p className="text-center text-textMuted mt-10">Loading feed...</p>
        ) : posts.length === 0 ? (
          <div className="text-center mt-16 text-textMuted">
            <span className="text-4xl mb-4 block">📭</span>
            <h2>No posts yet</h2>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <AnimatePresence>
              {posts.map(post => {
                const isAuthor = post.author._id === (loggedUser.user?._id || loggedUser._id);
                const isFollowing = following.includes(post.author._id);

                return (
                  <motion.div 
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/60 border border-border rounded-3xl overflow-hidden backdrop-blur-md shadow-xl"
                  >
                    {/* Header */}
                    <div className="p-4 flex justify-between items-center border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <Link to={`/profile/${post.author._id}`} className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 p-[2px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
                            {post.author.profilePicture || post.author.avatar ? (
                              <img src={post.author.profilePicture || post.author.avatar} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-sm">{(post.author.name || 'U')[0]}</span>
                            )}
                          </div>
                        </Link>
                        <div>
                          <Link to={`/profile/${post.author._id}`} className="font-bold text-text no-underline hover:text-primary transition">
                            {post.author.name || post.author.username}
                          </Link>
                          <span className="text-xs text-textMuted block">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {!isAuthor && (
                        <button 
                          onClick={() => handleFollow(post.author._id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${isFollowing ? 'bg-surface border border-border text-text hover:bg-white/5' : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/30'}`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>

                    {/* Media */}
                    {post.mediaUrl && (
                      <div className="w-full bg-black flex justify-center items-center max-h-[600px] overflow-hidden">
                        {post.mediaType === 'video' ? (
                          <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-contain" />
                        ) : (
                          <img src={post.mediaUrl} alt="Post media" className="w-full max-h-[600px] object-contain" />
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {post.description && (
                      <div className="p-4 pb-2 text-text text-sm">
                        <span className="font-bold mr-2">{post.author.name || post.author.username}</span>
                        {post.description}
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="p-4 pt-2">
                      {post.comments && post.comments.length > 0 && (
                        <div className="mb-3 flex flex-col gap-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          {post.comments.map((c, i) => (
                            <div key={i} className="text-[0.85rem]">
                              <span className="font-bold text-primary mr-2">{c.user?.name || c.user?.username || 'User'}</span>
                              <span className="text-text/90">{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Comment Input */}
                      <div className="flex gap-2 items-center mt-2 border-t border-border/50 pt-3">
                        <input 
                          type="text" 
                          placeholder="Add a comment..."
                          className="flex-1 bg-transparent border-none text-sm text-text focus:outline-none"
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                        />
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setShowEmojiPicker(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                            className="text-lg grayscale hover:grayscale-0 transition"
                          >
                            😊
                          </button>
                          {showEmojiPicker[post._id] && (
                            <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl flex gap-2 z-50">
                              {emojis.map(e => (
                                <button 
                                  key={e} 
                                  type="button" 
                                  onClick={() => { 
                                    setCommentText(prev => ({ ...prev, [post._id]: (prev[post._id] || '') + e })); 
                                    setShowEmojiPicker(prev => ({ ...prev, [post._id]: false })); 
                                  }}
                                  className="hover:scale-125 transition"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleCommentSubmit(post._id)}
                          disabled={!commentText[post._id]?.trim()}
                          className="text-primary font-bold text-sm disabled:opacity-50 transition"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
