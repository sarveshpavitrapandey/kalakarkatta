import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get('http://localhost:5000/api/events/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const badgeStyle = (color) => ({
    display: 'inline-block',
    background: color,
    borderRadius: 20,
    padding: '0.2rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  });

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)',
      padding: '4rem 1rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>🎟️ My Events</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Events you have created</p>
          </div>
          <Link to="/create-event" style={{
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            color: '#0f0c29',
            padding: '0.7rem 1.4rem',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            + New Event
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '4rem' }}>Loading your events...</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '6rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎪</div>
            <h2 style={{ color: 'rgba(255,255,255,0.6)' }}>No events yet</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Create your first event and share it with the community!</p>
            <Link to="/create-event" style={{
              display: 'inline-block', marginTop: '1.5rem',
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              color: '#0f0c29', padding: '0.8rem 2rem',
              borderRadius: 10, textDecoration: 'none', fontWeight: 700,
            }}>
              🚀 Create First Event
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {events.map(ev => (
              <div
                key={ev._id}
                style={cardStyle}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(167,139,250,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Category badge + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={badgeStyle('rgba(167,139,250,0.2)')}>{ev.category || 'Event'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>📅 {ev.date}</span>
                </div>

                {/* Title */}
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{ev.title}</h3>

                {/* Location */}
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                  📍 {ev.location || 'Location TBD'}
                </p>

                {/* Description */}
                {ev.description && (
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {ev.description}
                  </p>
                )}

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                  <span style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
                    🎫 {ev.availableSlots}/{ev.totalSlots} slots
                  </span>
                  <span style={{ color: ev.price === 0 ? '#34d399' : '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                    {ev.price === 0 ? '✅ Free' : `₹${ev.price}`}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
                  <span style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600 }}>
                    👥 {ev.attendees?.length || 0} attendees
                  </span>
                  <button
                    onClick={() => deleteEvent(ev._id)}
                    style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
