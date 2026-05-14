import { useEffect, useState, useContext } from 'react';
import EventModal from './EventModal.jsx';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePayment = async (eventItem) => {
    if (!user) {
      alert("Please login to join events");
      navigate('/login');
      return;
    }

    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      
      // Create Order
      const { data: orderData } = await axios.post('http://localhost:5000/api/payments/create-order', 
        { eventId: eventItem._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: "", // Fetch from server
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KalakarKatta",
        description: `Joining ${eventItem.title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await axios.post('http://localhost:5000/api/payments/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("Payment successful! Ticket confirmed.");
            // Refresh events to show updated joined count
            const res = await fetch('http://localhost:5000/api/events');
            const data = await res.json();
            setEvents(data);
          } catch (err) {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: user?.user?.name || "",
          email: user?.user?.email || "",
        },
        theme: { color: "#00C9FF" },
      };

      // Get Key
      const { data: keyData } = await axios.get('http://localhost:5000/api/payments/key', {
        headers: { Authorization: `Bearer ${token}` }
      });
      options.key = keyData.key;

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error initializing payment");
    }
  };

  if (loading) return <section className="events"><p className="text-center text-textMuted py-20">Loading events...</p></section>;

  return (
    <section className="events container py-20" id="events">
      <header className="section-header text-center mb-16">
        <h2 className="text-4xl font-black mb-4">Upcoming Events</h2>
        <p className="text-textMuted uppercase tracking-widest text-xs font-bold">Discover city rituals & creative showcases</p>
      </header>
      
      <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(ev => (
          <article key={ev._id} className="event-card bg-surface/40 backdrop-blur-xl border border-border rounded-[2rem] p-8 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="event-tag bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{ev.category}</div>
              <div className="text-white font-black text-xl">₹{ev.price || 0}</div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{ev.title}</h3>
            <p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-4">{ev.date} • {ev.location}</p>
            <p className="text-textMuted text-sm mb-8 line-clamp-3 leading-relaxed">{ev.description}</p>
            
            <div className="flex flex-col gap-4">
              <button 
                className="cta primary w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" 
                onClick={() => handlePayment(ev)}
              >
                {ev.price > 0 ? 'Book Ticket' : 'Register Now'}
              </button>
              <a className="text-center text-xs text-textMuted hover:text-white transition" href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(ev.title)} target="_blank" rel="noreferrer">
                Watch Related Content →
              </a>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="text-[10px] text-textMuted uppercase font-bold tracking-widest">{ev.attendees?.length || 0} CREATORS JOINED</div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </article>
        ))}
      </div>
      <EventModal open={open} onClose={()=>{setOpen(false); setSelected(null);}} event={selected} />
    </section>
  );
}
