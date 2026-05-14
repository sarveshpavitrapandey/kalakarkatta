const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Event = require('../models/Event');
const Order = require('../models/Order');
const requireAuth = require('../middleware/requireAuth');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/payments/key
router.get('/key', requireAuth, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payments/create-order
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.availableSlots <= 0) return res.status(400).json({ error: 'Event is sold out' });

    const options = {
      amount: event.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_event_${eventId}_user_${req.user._id}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = new Order({
      user: req.user._id,
      event: event._id,
      razorpayOrderId: razorpayOrder.id,
      status: 'Created'
    });

    await newOrder.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    logger.error('Razorpay Create Order Error: ', error);
    next(error);
  }
});

// POST /api/payments/verify-payment
router.post('/verify-payment', requireAuth, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      return res.status(400).json({ error: 'Transaction is not legit!' });
    }

    // Find order
    const order = await Order.findOne({ razorpayOrderId }).populate('event');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Update Order
    order.status = 'Paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Decrement Event slots and add attendee
    const event = order.event;
    event.availableSlots -= 1;
    event.attendees.push({
      name: req.user.name,
      email: req.user.email
    });
    await event.save();

    logger.info(`Payment verified for order: ${order._id}`);

    // Send Confirmation Email
    try {
      const message = `
        <h1>Ticket Confirmation</h1>
        <p>Hi ${req.user.name},</p>
        <p>Your payment for <strong>${event.title}</strong> was successful!</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p>Thank you for supporting artists on KalakarKatta.</p>
      `;
      await sendEmail({
        email: req.user.email,
        subject: `KalakarKatta - Ticket Confirmed for ${event.title}`,
        message
      });
    } catch (emailErr) {
      logger.error('Failed to send ticket email: ', emailErr);
    }

    // Real-time Notification logic can be emitted here later

    res.json({ message: 'Payment verified successfully', orderId: order._id });
  } catch (error) {
    logger.error('Payment Verification Error: ', error);
    next(error);
  }
});

module.exports = router;
