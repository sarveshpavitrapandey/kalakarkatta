import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/feed.css';

const PREDEFINED_SKILLS = ["Musician", "Actor", "Artist", "Writer", "Producer", "Dancer"];

export default function OnboardingPage() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = JSON.parse(localStorage.getItem('user'))?.token;

    const formData = new FormData();
    formData.append('username', username.toLowerCase().trim());
    formData.append('bio', bio);
    formData.append('skills', selectedSkills.join(','));
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const res = await axios.put('http://localhost:5000/api/users/onboarding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local storage and context with the newly populated user
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      const updatedData = { ...currentUserData, user: res.data };
      localStorage.setItem('user', JSON.stringify(updatedData));
      dispatch({ type: 'LOGIN', payload: updatedData });

      navigate('/profile');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-page" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="create-post-container">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Set Up Your Identity</h2>
        <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>Claim your unique @username and tell us what you do.</p>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label htmlFor="pfp-upload" style={{ cursor: 'pointer', display: 'block', position: 'relative' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '2px dashed rgba(255,255,255,0.3)'
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa' }}>+ Photo</span>
                )}
              </div>
            </label>
            <input id="pfp-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Unique Username (cannot be changed)</label>
          <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
            <span style={{ padding: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-strong)' }}>@</span>
            <input 
              type="text" 
              placeholder="Choose a unique username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none' }}
            />
          </div>

          <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Bio</label>
          <textarea 
            placeholder="Tell us about your art..." 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            rows="3"
            style={{ padding: '0.8rem', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}
          />

          <label style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>What are your disciplines?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {PREDEFINED_SKILLS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  background: selectedSkills.includes(skill) ? 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)' : 'rgba(255,255,255,0.1)',
                  color: selectedSkills.includes(skill) ? '#000' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: selectedSkills.includes(skill) ? 'bold' : 'normal'
                }}
              >
                {skill}
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-hire" disabled={loading} style={{ padding: '1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Setting up...' : 'Complete Profile'}
          </button>
        </form>
        {message && <p style={{ color: '#ff4b2b', marginTop: '1rem', textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  );
}
