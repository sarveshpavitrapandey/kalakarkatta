require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const logger = require('./src/utils/logger');

const userRoutes = require('./src/routes/users');
const worksRoutes = require('./src/routes/works');
const eventRoutes = require('./src/routes/events');
const authRoutes = require('./src/routes/auth.routes');
const postRoutes = require('./src/routes/posts.routes');
const jobRoutes = require('./src/routes/jobs.routes');
const paymentRoutes = require('./src/routes/payments.routes');
const messageRoutes = require('./src/routes/messages.routes');
const notificationRoutes = require('./src/routes/notifications.routes');
const chatbotRoutes = require('./src/routes/chatbot.routes');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Map to store userId -> socketId
const connectedUsers = new Map();

// Make io and connectedUsers accessible in routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Middleware
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(morgan('dev')); // Request logging

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kalakarkattaa';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => logger.error('DB Connection Error: ', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  logger.info(`User connected to socket: ${socket.id}`);

  // When a user connects to the app, they send their DB user ID
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    logger.info(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle direct messages
  socket.on('send_message', (data) => {
    // data should have { senderId, recipientId, text, messageId, etc. }
    const recipientSocket = connectedUsers.get(data.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_message', data);
    } else {
      logger.info(`Recipient ${data.recipientId} is offline. Saving to DB only.`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
    // Remove from map
    for (let [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Seed example events if empty
const Event = require('./src/models/Event');
async function seedEvents() {
  try {
    const c = await Event.countDocuments();
    if (c === 0) {
      const samples = [
        { title: 'Moonlight Rooftop Jam', category: 'Music', date: '2025-12-12', location: 'Bandra, Mumbai', description: 'An intimate rooftop showcase featuring indie pop bands.' },
        { title: 'Street Canvas Residency', category: 'Art', date: '2025-12-15', location: 'Fort Arts District', description: 'A three-week mural residency pairing muralists with city spaces.' }
      ];
      await Event.insertMany(samples);
      logger.info('Seeded sample events');
    }
  } catch (err) {
    logger.error('Seed event error:', err);
  }
}
seedEvents();

// ─── Auto-cleanup: Delete expired events and jobs ─────────────────────────────
const Job = require('./src/models/Job');

async function cleanupExpiredContent() {
  try {
    const now = new Date();

    // Delete events whose date has passed
    const deletedEvents = await Event.deleteMany({ date: { $lt: now } });
    if (deletedEvents.deletedCount > 0) {
      logger.info(`Auto-cleanup: Removed ${deletedEvents.deletedCount} expired event(s)`);
    }

    // Delete jobs whose deadline has passed (only if deadline was set)
    const deletedJobs = await Job.deleteMany({ deadline: { $lt: now, $ne: null } });
    if (deletedJobs.deletedCount > 0) {
      logger.info(`Auto-cleanup: Removed ${deletedJobs.deletedCount} expired job(s)`);
    }
  } catch (err) {
    logger.error('Auto-cleanup error:', err);
  }
}

// Run once on startup, then every 24 hours
cleanupExpiredContent();
setInterval(cleanupExpiredContent, 24 * 60 * 60 * 1000);

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

