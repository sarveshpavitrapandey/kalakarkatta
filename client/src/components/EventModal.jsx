import { useState, useEffect } from 'react';

export default function EventModal({ open, onClose, event }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.address) {
            setCity(data.address.city || data.address.town || data.address.village || data.address.county || '');
          }
        } catch (err) {}
      }, (err) => {});
    }
  }, [open]);

  if (!open || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/events/join', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ eventId: event._id, name, email, city })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Joined successfully!');
        setTimeout(()=> { setMsg(''); onClose(); }, 900);
      } else {
        setMsg(data.error || 'Failed to join');
      }
    } catch (err) {
      setMsg('Server error');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Join: {event.title}</h2>
        <p style={{fontSize:14}}>{event.description}</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Enter your name" value={name} onChange={e=>setName(e.target.value)} required />
          <input placeholder="Enter your email address" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <input placeholder="City (auto-detected)" value={city} onChange={e=>setCity(e.target.value)} />
          <div style={{display:'flex', gap:8}}>
            <button type="submit">Join Event</button>
            <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
        {msg && <p className="message">{msg}</p>}
      </div>
    </div>
  );
}
