import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import ThemeSelector from "./ThemeSelector.jsx";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Header() {
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const { user: loggedUser, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const createDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) setCreateDropdownOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
      if (themeRef.current && !themeRef.current.contains(event.target)) setThemeOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (loggedUser) {
      fetchCounts();
    }
  }, [loggedUser]);

  const fetchCounts = async () => {
    try {
      const msgRes = await axios.get('http://localhost:5000/api/messages/unread-count', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setUnreadMsgCount(msgRes.data.unreadCount);

      const notifRes = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setNotifications(notifRes.data);
      setUnreadNotifCount(notifRes.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadNotifCount(prev => prev + 1);
      });

      socket.on('receive_message', () => {
        // Refresh unread count when a new message arrives
        setUnreadMsgCount(prev => prev + 1);
      });

      return () => {
        socket.off('new_notification');
        socket.off('receive_message');
      };
    }
  }, [socket]);

  const handleNotificationClick = async () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      setUnreadNotifCount(0); // Clear badge immediately on open
    }
  };

  const handleDismissNotification = async (notifId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notifId}`, {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== notifId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications/read-all', {
        headers: { Authorization: `Bearer ${loggedUser.token}` }
      });
      setNotifications([]);
      setUnreadNotifCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  if (!isHomePage) {
    return (
      <>
        {/* Navigation Arrows on Left */}
        <div className="fixed top-4 left-6 flex items-center gap-2 z-[900]">
          <button onClick={() => navigate(-1)} className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-xl cursor-pointer py-1 px-3 rounded-lg hover:bg-black/60 transition flex items-center justify-center">
            ←
          </button>
          <button onClick={() => navigate(1)} className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-xl cursor-pointer py-1 px-3 rounded-lg hover:bg-black/60 transition flex items-center justify-center">
            →
          </button>
          <Link to="/" className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-lg cursor-pointer py-1.5 px-3 rounded-lg hover:bg-black/60 transition flex items-center justify-center no-underline ml-2">
            🏠
          </Link>
        </div>

        <div className="fixed top-4 right-6 flex items-center gap-4 z-[900]">
          {/* Theme Dropdown */}
          <div ref={themeRef} className="relative">
            <button 
              onClick={() => setThemeOpen(!themeOpen)}
              className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-lg cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-black/60 transition"
            >
              🎨
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 right-0 bg-[#0f0c29]/95 backdrop-blur-xl border border-white/10 rounded-xl p-0 min-w-[250px] z-[1000] shadow-2xl overflow-hidden"
                >
                  <ThemeSelector />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {loggedUser ? (
            <>
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-xl cursor-pointer py-1.5 px-3 rounded-lg hover:bg-black/60 transition"
              >
                ☰
              </button>

              <div ref={createDropdownRef} className="relative">
                <button
                  onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                  className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-2xl leading-none cursor-pointer py-1 px-3 rounded-lg font-light hover:bg-black/60 transition"
                >
                  +
                </button>
                <AnimatePresence>
                  {createDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 right-0 bg-[#0f0c29]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[160px] flex flex-col gap-1 z-[1000] shadow-2xl"
                    >
                      {[
                        { to: '/upload', icon: '📷', label: 'Create Post' },
                        { to: '/create-job', icon: '💼', label: 'Create Job' },
                        { to: '/create-event', icon: '🎟️', label: 'Create Event' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setCreateDropdownOpen(false)}
                          className="text-white no-underline py-2 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-white/10 transition"
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/messages" className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-lg cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-black/60 transition relative no-underline">
                💬
                {unreadMsgCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadMsgCount}</span>}
              </Link>

              <div ref={notificationRef} className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="bg-black/40 backdrop-blur-md border border-white/15 text-white text-lg cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-black/60 transition relative"
                >
                  🔔
                  {unreadNotifCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifCount}</span>}
                </button>
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 right-0 bg-[#0f0c29]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 min-w-[250px] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2 z-[1000] shadow-2xl"
                    >
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h4 className="text-white text-sm m-0">Notifications</h4>
                        {notifications.length > 0 && (
                          <button onClick={handleClearAllNotifications} className="text-white/40 text-[10px] hover:text-red-400 transition bg-transparent border-none cursor-pointer">Clear all</button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                         <p className="text-white/50 text-sm">No notifications.</p>
                      ) : notifications.map(notif => (
                        <div key={notif._id} className="py-2 border-b border-white/5 last:border-0 flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-white text-sm m-0 leading-tight">{notif.message}</p>
                            <span className="text-white/50 text-[10px]">{new Date(notif.createdAt).toLocaleString()}</span>
                          </div>
                          <button onClick={() => handleDismissNotification(notif._id)} className="text-white/30 hover:text-red-400 transition bg-transparent border-none cursor-pointer text-xs flex-shrink-0 mt-0.5">✕</button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/profile" className="bg-transparent border-none cursor-pointer p-0">
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white/25 flex justify-center items-center font-bold text-lg text-black ${(loggedUser.user?.profilePicture || loggedUser.profilePicture) ? 'bg-transparent' : 'bg-gradient-to-br from-primary to-blue-400'}`}>
                  {(loggedUser.user?.profilePicture || loggedUser.profilePicture) ? (
                    <img src={loggedUser.user?.profilePicture || loggedUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (loggedUser.user?.name || loggedUser.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition no-underline">Login</Link>
              <Link to="/signup" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-primary/30 no-underline">Sign Up</Link>
            </div>
          )}
        </div>
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      </>
    );
  }

  // HOME PAGE HEADER
  return (
    <>
      <header className="sticky top-0 z-[100] backdrop-blur-lg bg-background/80 border-b border-border h-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center gap-6">
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button onClick={() => navigate(-1)} className="bg-transparent border-none text-textMuted hover:text-text cursor-pointer text-xl">←</button>
              <button onClick={() => navigate(1)} className="bg-transparent border-none text-textMuted hover:text-text cursor-pointer text-xl">→</button>
            </div>
            <Link to="/" className="text-inherit no-underline flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-highlight text-xl shadow-lg relative">
                <span className="font-bold">♪</span>
                <span className="absolute bottom-1 right-1 text-xs text-blue-300">✦</span>
              </div>
            </Link>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                placeholder="Search artists, jobs, events..." 
                className="w-full bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-primary transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-textMuted">🔍</span>
            </form>
          </div>

          <div className="flex items-center gap-5">
            {/* Theme Dropdown */}
            <div ref={themeRef} className="relative flex items-center">
              <button 
                onClick={() => setThemeOpen(!themeOpen)}
                className="bg-transparent border-none text-xl cursor-pointer hover:text-primary transition"
              >
                🎨
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-10 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-xl p-0 min-w-[250px] z-[1000] shadow-xl overflow-hidden"
                  >
                    <ThemeSelector />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {loggedUser ? (
              <>
                <button onClick={() => setSidebarOpen(true)} className="bg-transparent border-none text-text text-2xl leading-none cursor-pointer hover:text-primary transition">
                  ☰
                </button>

                <div ref={createDropdownRef} className="relative flex items-center">
                  <button onClick={() => setCreateDropdownOpen(!createDropdownOpen)} className="bg-transparent border-none text-text text-3xl leading-none cursor-pointer hover:text-primary transition">
                    +
                  </button>
                  <AnimatePresence>
                    {createDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-10 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-xl p-2 min-w-[160px] flex flex-col gap-1 z-[1000] shadow-xl"
                      >
                        {[
                          { to: '/upload', icon: '📷', label: 'Create Post' },
                          { to: '/create-job', icon: '💼', label: 'Create Job' },
                          { to: '/create-event', icon: '🎟️', label: 'Create Event' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setCreateDropdownOpen(false)}
                            className="text-text no-underline py-2 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-surface transition"
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/messages" className="text-xl relative hover:text-primary transition cursor-pointer no-underline">
                  💬
                  {unreadMsgCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadMsgCount}</span>}
                </Link>

                <div ref={notificationRef} className="relative flex items-center">
                  <button 
                    onClick={handleNotificationClick}
                    className="bg-transparent border-none text-xl relative cursor-pointer hover:text-primary transition"
                  >
                    🔔
                    {unreadNotifCount > 0 && <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifCount}</span>}
                  </button>
                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-10 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-xl p-3 min-w-[250px] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2 z-[1000] shadow-xl"
                      >
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <h4 className="text-text text-sm m-0">Notifications</h4>
                          {notifications.length > 0 && (
                            <button onClick={handleClearAllNotifications} className="text-textMuted text-[10px] hover:text-red-400 transition bg-transparent border-none cursor-pointer">Clear all</button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                           <p className="text-textMuted text-sm">No notifications.</p>
                        ) : notifications.map(notif => (
                          <div key={notif._id} className="py-2 border-b border-border/50 last:border-0 flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="text-text text-sm m-0 leading-tight">{notif.message}</p>
                              <span className="text-textMuted text-[10px]">{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                            <button onClick={() => handleDismissNotification(notif._id)} className="text-textMuted hover:text-red-400 transition bg-transparent border-none cursor-pointer text-xs flex-shrink-0 mt-0.5">✕</button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/profile" className="bg-transparent border-none cursor-pointer p-0">
                  <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-border flex justify-center items-center font-bold text-lg text-black ${(loggedUser.user?.profilePicture || loggedUser.profilePicture) ? 'bg-transparent' : 'bg-gradient-to-br from-primary to-blue-400'}`}>
                    {(loggedUser.user?.profilePicture || loggedUser.profilePicture) ? (
                      <img src={loggedUser.user?.profilePicture || loggedUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (loggedUser.user?.name || loggedUser.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="px-5 py-2 rounded-xl border border-border text-text font-semibold text-sm hover:bg-surface transition no-underline">Login</Link>
                <Link to="/signup" className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-primary/30 no-underline">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
    </>
  );
}
