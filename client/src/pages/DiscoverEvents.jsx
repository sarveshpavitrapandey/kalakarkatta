import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function DiscoverEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
    loadRazorpayScript();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (eventId) => {
    if (!loggedUser) {
      alert("Please login to buy a ticket.");
      return;
    }

    try {
      // 1. Fetch Razorpay key from backend
      const keyRes = await axios.get('http://localhost:5000/api/payments/key', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      const razorpayKey = keyRes.data.key;

      // 2. Create order on backend
      const orderRes = await axios.post('http://localhost:5000/api/payments/create-order', 
        { eventId },
        { headers: { Authorization: `Bearer ${loggedUser.token}` } }
      );

      const { orderId, amount, currency } = orderRes.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: amount.toString(),
        currency: currency,
        name: "KalakarKatta",
        description: "Event Ticket Booking",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4. Verify payment on backend
            await axios.post('http://localhost:5000/api/payments/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${loggedUser.token}` }
            });

            alert('Payment Successful! Your ticket is confirmed.');
            fetchEvents(); // Refresh available slots
          } catch (verifyErr) {
            console.error("Verification failed", verifyErr);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: loggedUser.user?.name || loggedUser.name,
          email: loggedUser.user?.email || loggedUser.email,
        },
        theme: {
          color: "#7c5cff" // main-accent color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed. Reason: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error initiating payment.");
    }
  };

  const handleRegister = async (eventId) => {
    if (!loggedUser) {
      alert("Please login to register for this event.");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/events/join', {
        eventId,
        name: loggedUser.user?.name || loggedUser.name,
        email: loggedUser.user?.email || loggedUser.email,
        city: 'Online' // Optional, could prompt user
      });
      alert('Successfully registered for the event!');
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed.");
    }
  };

  const filteredEvents = filterCategory ? events.filter(e => e.category === filterCategory) : events;
  const categories = ['Music', 'Art', 'Film', 'Dance', 'Theatre', 'Photography', 'Workshop', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-main pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header & Filter */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-4">
            Explore Events
          </h1>
          <p className="text-textMuted mb-8">Attend workshops, gigs, and meetups</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setFilterCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${!filterCategory ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border hover:bg-white/10'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filterCategory === cat ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-center text-textMuted mt-10">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center mt-16">
            <span className="text-5xl mb-4 block">🎟️</span>
            <h2 className="text-xl text-textMuted">No events found</h2>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {filteredEvents.map(ev => (
              <motion.div 
                key={ev._id}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                className="bg-surface/50 border border-border rounded-2xl p-6 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl transition duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {ev.category}
                  </span>
                  <span className="text-textMuted text-sm font-medium">📅 {new Date(ev.date).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-text">{ev.title}</h3>
                <p className="text-sm text-textMuted mb-4">📍 {ev.location}</p>
                <p className="text-sm text-textMuted line-clamp-3 mb-6 flex-1">{ev.description}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                  <div>
                    <span className="font-bold text-green-400 text-lg block">{ev.price === 0 ? 'Free' : `₹${ev.price}`}</span>
                    <span className="text-xs text-textMuted">{ev.availableSlots} spots left</span>
                  </div>
                  
                  {ev.price > 0 && ev.availableSlots > 0 ? (
                    <button 
                      onClick={() => handlePayment(ev._id)}
                      className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-primary/30 transition shadow-sm border-none cursor-pointer"
                    >
                      Buy Ticket
                    </button>
                  ) : ev.availableSlots <= 0 ? (
                    <button disabled className="bg-surface border border-border text-textMuted px-5 py-2 rounded-lg font-bold cursor-not-allowed">
                      Sold Out
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRegister(ev._id)}
                      className="bg-surface border border-border text-text px-5 py-2 rounded-lg font-bold cursor-pointer hover:bg-white/5 transition"
                    >
                      Register
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
