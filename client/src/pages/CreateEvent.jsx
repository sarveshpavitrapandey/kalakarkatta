import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [totalSlots, setTotalSlots] = useState(100);
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Blocks past dates — sets the minimum selectable date to today
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");
    try {
      setLoading(true);
      const payload = {
        title, category, date, location, description,
        price: Number(price),
        totalSlots: Number(totalSlots),
        availableSlots: Number(totalSlots)
      };
      await axios.post('http://localhost:5000/api/events', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Event created successfully!");
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const field = {
    background: 'var(--color-surface)',
    padding: '0.85rem 1rem',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.95rem',
    outline: 'none',
  };

  const label = {
    fontWeight: 600,
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.4rem',
  };

  const opt = { background: 'var(--color-bg-alt)', color: 'var(--color-text)' };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '4rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: 'var(--color-surface)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border)',
        borderRadius: 24,
        padding: '2.5rem',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎟️</div>
          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Host an Event
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Share your creativity with the world
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Title */}
          <div>
            <label style={label}>Event Title *</label>
            <input
              type="text"
              placeholder="e.g. Moonlight Rooftop Jam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={field}
            />
          </div>

          {/* Category + Date */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required style={field}>
                <option value="" disabled style={opt}>Select…</option>
                <option value="Music" style={opt}>🎵 Music</option>
                <option value="Art" style={opt}>🎨 Art</option>
                <option value="Film" style={opt}>🎬 Film</option>
                <option value="Dance" style={opt}>💃 Dance</option>
                <option value="Theatre" style={opt}>🎭 Theatre</option>
                <option value="Photography" style={opt}>📷 Photography</option>
                <option value="Workshop" style={opt}>🛠️ Workshop</option>
                <option value="Other" style={opt}>✨ Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Date *</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ ...field, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={label}>Location / Venue *</label>
            <input
              type="text"
              placeholder="e.g. Bandra, Mumbai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={field}
            />
          </div>

          {/* Description */}
          <div>
            <label style={label}>Description *</label>
            <textarea
              placeholder="Tell people what this event is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ ...field, resize: 'vertical' }}
            />
          </div>

          {/* Price + Slots */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Ticket Price (₹)</label>
              <input
                type="number"
                placeholder="0 = Free"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                style={field}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Capacity *</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                min="1"
                required
                style={field}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: 12,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.04em',
              background: loading
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
              color: loading ? '#888' : '#0f0c29',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(167,139,250,0.45)',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? '⏳ Creating Event...' : '🚀 Publish Event'}
          </button>
        </form>
      </div>
    </main>
  );
}
