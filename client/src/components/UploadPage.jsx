import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [taggedUsernames, setTaggedUsernames] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(f));
      } else {
        setPreview('video');
      }
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert("Please select a photo or video to upload.");
    
    const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    const form = new FormData();
    form.append("media", file);
    form.append("description", description);
    form.append("taggedUsernames", taggedUsernames);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/posts", form, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      alert("Post created successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-main pt-20 pb-20 flex justify-center items-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-surface/40 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Share Your Art</h1>
          <p className="text-textMuted font-medium uppercase tracking-widest text-xs">Upload a photo or video to your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Media Upload Area */}
          <div 
            className="relative h-64 md:h-80 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center bg-black/20"
            onClick={() => document.getElementById('media-input').click()}
          >
            {preview ? (
              preview === 'video' ? (
                <div className="flex flex-col items-center gap-2 text-primary font-bold">
                  <span className="text-4xl">🎬</span>
                  <span>Video Selected</span>
                </div>
              ) : (
                <img src={preview} className="w-full h-full object-contain" />
              )
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-3xl group-hover:scale-110 transition-transform">📷</div>
                <div className="text-white/60 font-medium">Click to select or drag and drop</div>
                <div className="text-xs text-textMuted uppercase tracking-widest font-black">Photos & Videos supported</div>
              </div>
            )}
            <input 
              id="media-input"
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              hidden 
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-3">Caption</label>
              <textarea 
                placeholder="Describe your creative process..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-primary transition resize-none placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-textMuted mb-3">Tag Collaborators</label>
              <input 
                type="text"
                placeholder="e.g. artist_name, creator_id" 
                value={taggedUsernames} 
                onChange={(e) => setTaggedUsernames(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-primary transition placeholder:text-white/20"
              />
              <p className="mt-2 text-[10px] text-textMuted italic">Separate usernames with commas</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Publish to Feed'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}