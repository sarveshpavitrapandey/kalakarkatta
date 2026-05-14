const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const ConnectionRequest = require('./src/models/ConnectionRequest');
const Conversation = require('./src/models/Conversation');
const Message = require('./src/models/Message');
const Event = require('./src/models/Event');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');
const Order = require('./src/models/Order');
const Notification = require('./src/models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kalakarkattaa';

async function initializeCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    console.log('Creating collections explicitly...');
    
    // createCollection forces MongoDB to create the collection immediately
    // even if there are no documents in it yet.
    await User.createCollection();
    console.log('✅ User collection created');

    await Post.createCollection();
    console.log('✅ Post collection created');

    await ConnectionRequest.createCollection();
    console.log('✅ ConnectionRequest collection created');

    await Conversation.createCollection();
    console.log('✅ Conversation collection created');

    await Message.createCollection();
    console.log('✅ Message collection created');

    await Event.createCollection();
    console.log('✅ Event collection created');

    await Job.createCollection();
    console.log('✅ Job collection created');

    await Application.createCollection();
    console.log('✅ Application collection created');

    await Order.createCollection();
    console.log('✅ Order collection created');

    await Notification.createCollection();
    console.log('✅ Notification collection created');

    console.log('All collections initialized successfully! Check MongoDB Compass.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating collections:', error);
    process.exit(1);
  }
}

initializeCollections();
