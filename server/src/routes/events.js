const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const requireAuth = require('../middleware/requireAuth');

// list events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get MY events (events created by me)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create event (auth protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const e = new Event({ ...req.body, creator: req.user._id });
    await e.save();
    res.status(201).json(e);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// delete event (only creator)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    if (ev.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can delete this event.' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// join event
router.post('/join', async (req, res) => {
  try {
    const { eventId, name, email, city } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    const errors = [];
    if (!eventId) errors.push('eventId is required');
    if (!name || !name.trim()) errors.push('name is required');
    if (!email || !email.trim()) {
      errors.push('email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('email is invalid');
    }
    if (!city || !city.trim()) errors.push('city is required');

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    if (ev.availableSlots <= 0) return res.status(400).json({ error: 'Event is sold out' });

    // Prevent duplicate registration (same email for same event)
    const alreadyRegistered = ev.attendees.some(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'This email is already registered for this event' });
    }

    ev.attendees.push({ name: name.trim(), email: email.trim().toLowerCase(), city: city.trim() });
    ev.availableSlots -= 1;
    await ev.save();
    res.json({ success: true, attendees: ev.attendees, availableSlots: ev.availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
