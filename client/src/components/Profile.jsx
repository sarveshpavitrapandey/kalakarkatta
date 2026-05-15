import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, dispatch, socket } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Selected post for modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['❤️', '🔥', '👏', '🎨', '🌟', '🙌', '💯', '✨'];

  // Edit profile modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState('Unavailable');
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  // Edit Post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostDescription, setEditPostDescription] = useState('');

  const actualCurrentUser = currentUser?.user || currentUser;
  const profileId = id || actualCurrentUser?._id;

  useEffect(() => {
    if (!profileId) return;
    fetchProfile();
  }, [profileId, actualCurrentUser]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${profileId}`);
      setProfileData(response.data.user);
      setPosts(response.data.posts);
      
      if (actualCurrentUser && response.data.user.followers.includes(actualCurrentUser._id)) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!actualCurrentUser) return;
    try {
      const token = actualCurrentUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      await axios.put(`http://localhost:5000/api/users/${profileId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsFollowing(!isFollowing);
      fetchProfile(); // Refresh stats
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const openEditProfile = () => {
    setEditName(profileData.name || '');
    setEditBio(profileData.bio || '');
    setEditStatus(profileData.availabilityStatus || 'Unavailable');
    setEditProfilePic(null);
    setEditPreview(null);
    setEditProfileOpen(true);
  };

  const saveProfile = async () => {
    try {
      const token = actualCurrentUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      formData.append('availabilityStatus', editStatus);
      if (editProfilePic) formData.append('profilePicture', editProfilePic);
      
      const res = await axios.put('http://localhost:5000/api/users/onboarding', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      
      setProfileData({ ...profileData, ...res.data });
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const newUser = { ...storedUser, user: res.data };
        localStorage.setItem('user', JSON.stringify(newUser));
        dispatch({ type: 'LOGIN', payload: newUser });
      }
      setEditProfileOpen(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const token = actualCurrentUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) return alert("Please login to comment");

      const res = await axios.post(`http://localhost:5000/api/posts/${selectedPost._id}/comments`, 
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local post state
      const updatedComments = res.data;
      const updatedPost = { ...selectedPost, comments: updatedComments };
      setSelectedPost(updatedPost);
      setPosts(posts.map(p => p._id === selectedPost._id ? updatedPost : p));
      setCommentText('');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to post comment");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = actualCurrentUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p._id !== postId));
      setSelectedPost(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete post");
    }
  };

  const handleUpdatePost = async (postId) => {
    try {
      const token = actualCurrentUser?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, 
        { description: editPostDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedPost = { ...selectedPost, description: res.data.description };
      setSelectedPost(updatedPost);
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      setIsEditingPost(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update post");
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-main flex items-center justify-center text-white">Loading...</div>;
  if (!profileData) return <div className="min-h-screen bg-gradient-main flex items-center justify-center text-white">Profile not found</div>;

  const isOwnProfile = actualCurrentUser && actualCurrentUser._id === profileId;

  return (
    <div className="min-h-screen bg-gradient-main pt-10 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar with Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-400 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
              <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-surface overflow-hidden shadow-2xl flex items-center justify-center ${!profileData.profilePicture ? 'bg-gradient-to-br from-primary to-blue-400' : ''}`}>
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl md:text-7xl font-black text-white drop-shadow-lg">
                    {(profileData.name || profileData.username || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              {profileData.availabilityStatus && profileData.availabilityStatus !== 'Unavailable' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-surface shadow-lg whitespace-nowrap">
                  {profileData.availabilityStatus.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {profileData.username}
                </h1>
                <div className="flex gap-2 justify-center md:justify-start">
                  {isOwnProfile ? (
                    <button 
                      onClick={openEditProfile}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-md"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={toggleFollow}
                        className={`px-8 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${isFollowing ? 'bg-white/10 text-white' : 'bg-primary text-white shadow-primary/30 hover:scale-105'}`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <Link to={`/messages/${profileData._id}`} className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white no-underline flex items-center transition-all backdrop-blur-md">
                        Message
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex justify-center md:justify-start gap-8 mb-8">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-black text-white">{posts.length}</div>
                  <div className="text-xs uppercase tracking-widest text-textMuted font-bold">Posts</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-black text-white">{profileData.followers?.length || 0}</div>
                  <div className="text-xs uppercase tracking-widest text-textMuted font-bold">Followers</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-black text-white">{profileData.following?.length || 0}</div>
                  <div className="text-xs uppercase tracking-widest text-textMuted font-bold">Following</div>
                </div>
              </div>

              {/* Bio & Skills */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white/90">{profileData.name}</h2>
                <p className="text-textMuted leading-relaxed max-w-xl italic">
                  "{profileData.bio || 'No bio yet...'}"
                </p>
                {profileData.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="flex justify-center gap-12 mb-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-sm font-black tracking-widest uppercase transition-all ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`pb-4 text-sm font-black tracking-widest uppercase transition-all ${activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}
          >
            About
          </button>
        </div>

        {/* Grid View */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <AnimatePresence>
              {posts.map((post, idx) => (
                <motion.div 
                  key={post._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-primary/20 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-6 text-white">
                    <span className="flex items-center gap-2 font-bold"><span className="text-xl">💬</span> {post.comments?.length || 0}</span>
                  </div>
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {posts.length === 0 && (
              <div className="col-span-full py-20 text-center text-textMuted">
                <span className="text-5xl mb-4 block opacity-20">🎨</span>
                <p className="font-bold tracking-widest uppercase text-sm opacity-40">No work showcased yet</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-surface/30 backdrop-blur-md border border-border rounded-3xl p-8 text-textMuted leading-relaxed"
          >
            <h3 className="text-white font-bold mb-4">Artist Statement</h3>
            <p className="mb-6 italic">{profileData.bio || 'The artist has not provided an extended statement yet.'}</p>
            
            <h3 className="text-white font-bold mb-4">Core Skills & Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills?.map(s => (
                <span key={s} className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-sm">{s}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Post Detail Modal (With Commenting) */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl h-full max-h-[85vh] bg-[#0f0c29] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl z-10"
            >
              {/* Left: Media Area */}
              <div className="flex-[1.5] bg-black flex items-center justify-center overflow-hidden">
                {selectedPost.mediaType === 'video' ? (
                  <video src={selectedPost.mediaUrl} controls className="w-full h-full object-contain" autoPlay />
                ) : (
                  <img src={selectedPost.mediaUrl} className="w-full h-full object-contain" />
                )}
              </div>

              {/* Right: Interaction Area */}
              <div className="flex-1 flex flex-col bg-[#0f0c29] border-l border-white/5 min-w-[320px]">
                {/* Header */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center ${!profileData.profilePicture ? 'bg-gradient-to-br from-primary to-blue-400' : ''}`}>
                        {profileData.profilePicture ? (
                          <img src={profileData.profilePicture} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-white">{(profileData.name || profileData.username || 'U')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{profileData.username}</div>
                        <div className="text-[10px] text-textMuted uppercase tracking-widest">{new Date(selectedPost.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setIsEditingPost(true); setEditPostDescription(selectedPost.description); }}
                          className="p-2 hover:bg-white/5 rounded-full text-textMuted hover:text-white transition"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeletePost(selectedPost._id)}
                          className="p-2 hover:bg-red-500/10 rounded-full text-textMuted hover:text-red-400 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {isEditingPost ? (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <textarea 
                        className="w-full bg-transparent text-white text-sm focus:outline-none mb-2"
                        value={editPostDescription}
                        onChange={(e) => setEditPostDescription(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsEditingPost(false)} className="text-xs font-bold text-textMuted">Cancel</button>
                        <button onClick={() => handleUpdatePost(selectedPost._id)} className="text-xs font-bold text-primary">Save</button>
                      </div>
                    </div>
                  ) : selectedPost.description && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img src={profileData.profilePicture} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-primary mr-2">{profileData.username}</span>
                        <p className="text-sm text-text/90 leading-tight mt-1">{selectedPost.description}</p>
                      </div>
                    </div>
                  )}

                  {selectedPost.comments?.map((c, i) => (
                    <div key={i} className="flex gap-4 animate-fadeIn">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 flex-shrink-0">
                        {c.user?.profilePicture ? <img src={c.user.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">{(c.user?.name || 'U')[0]}</div>}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white/90 mr-2">{c.user?.username || c.user?.name || 'User'}</span>
                        <p className="text-sm text-text/80 leading-tight mt-1">{c.text}</p>
                        <span className="text-[8px] text-textMuted uppercase mt-1 block">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="p-6 border-t border-white/5">
                  <form onSubmit={handleCommentSubmit} className="relative">
                    <input 
                      type="text" 
                      placeholder="Add a comment..."
                      className="w-full bg-surface border border-border rounded-xl py-3 px-4 pr-12 text-sm text-text focus:outline-none focus:border-primary transition"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-lg grayscale hover:grayscale-0 transition"
                      >
                        😊
                      </button>
                    </div>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl flex gap-2 z-50">
                        {emojis.map(e => (
                          <button 
                            key={e} 
                            type="button" 
                            onClick={() => { setCommentText(prev => prev + e); setShowEmojiPicker(false); }}
                            className="hover:scale-125 transition"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={!commentText.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs uppercase tracking-widest disabled:opacity-30"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black transition z-20"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setEditProfileOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-[#0f0c29] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl z-10"
            >
              <h2 className="text-2xl font-bold mb-8 text-white">Edit Profile</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-6">
                {/* PFP Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('pfp-input').click()}>
                    <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden relative">
                      <img src={editPreview || profileData.profilePicture} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold">CHANGE</span>
                      </div>
                    </div>
                  </div>
                  <input id="pfp-input" type="file" hidden onChange={(e) => {
                    const f = e.target.files[0];
                    if(f) { setEditProfilePic(f); setEditPreview(URL.createObjectURL(f)); }
                  }} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-sm text-text focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-2">Bio</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-sm text-text focus:outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-2">Work Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-sm text-text focus:outline-none focus:border-primary transition"
                    >
                      <option value="Unavailable" className="bg-[#0f0c29] text-white">Unavailable</option>
                      <option value="Open to Work" className="bg-[#0f0c29] text-white">Open to Work</option>
                      <option value="Hiring" className="bg-[#0f0c29] text-white">Hiring</option>
                      <option value="Collaborating" className="bg-[#0f0c29] text-white">Collaborating</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditProfileOpen(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition">CANCEL</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/30 hover:scale-105 transition">SAVE CHANGES</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
