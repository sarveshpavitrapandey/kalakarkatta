import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { id: otherUserId } = useParams();
  const { user: currentUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = currentUserData?.user || currentUserData;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Initialize Socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.emit('register', currentUser._id);

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${otherUserId}`);
        setOtherUser(userRes.data.user);

        const token = currentUserData?.token;
        const msgRes = await axios.get(`http://localhost:5000/api/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(msgRes.data);
        
        // Mark as read
        await axios.put(`http://localhost:5000/api/messages/read/${otherUserId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (err) {
        console.error("Error fetching chat data:", err);
      }
    };

    fetchData();

    return () => newSocket.close();
  }, [otherUserId, currentUser, navigate]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.sender === otherUserId || newMessage.sender._id === otherUserId) {
        setMessages((prev) => [...prev, newMessage]);
        // Also mark as read since we are on the page
        axios.put(`http://localhost:5000/api/messages/read/${otherUserId}`, {}, {
          headers: { Authorization: `Bearer ${currentUserData?.token}` }
        }).catch(err => console.error(err));
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, otherUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setIsUploading(true);
    const token = currentUserData?.token;
    
    try {
      const formData = new FormData();
      formData.append('recipientId', otherUserId);
      if (inputText.trim()) formData.append('text', inputText);
      if (selectedFile) formData.append('media', selectedFile);

      const res = await axios.post('http://localhost:5000/api/messages', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const newMessage = res.data;
      setMessages((prev) => [...prev, newMessage]);
      
      if (socket) {
        socket.emit('send_message', {
          ...newMessage,
          recipientId: otherUserId
        });
      }

      setInputText('');
      setSelectedFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!otherUser) return <div className="min-h-screen bg-background pt-20 text-center text-textMuted">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-surface/30 border-x border-border shadow-2xl relative">
      
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 bg-surface/80 backdrop-blur-md border-b border-border shadow-md z-10 sticky top-0">
        <Link to="/messages" className="text-textMuted hover:text-text transition text-xl no-underline mr-2">
          ←
        </Link>
        
        <div className="relative">
          <Link to={`/profile/${otherUser._id}`} className="w-12 h-12 rounded-full overflow-hidden block bg-gradient-to-br from-primary to-blue-400 p-[2px]">
            <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
              {otherUser.profilePicture ? (
                <img src={otherUser.profilePicture} alt={otherUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-text">{otherUser.name.charAt(0)}</span>
              )}
            </div>
          </Link>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></span>
        </div>

        <div>
          <h3 className="m-0 text-lg font-bold text-text">{otherUser.name}</h3>
          <p className="m-0 text-sm text-green-400 font-medium">Active now</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-gradient-to-b from-transparent to-background/50">
        {messages.length === 0 ? (
          <div className="m-auto text-center text-textMuted">
            <span className="text-4xl block mb-2">👋</span>
            <p>Say hi to {otherUser.name}!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`max-w-[75%] px-5 py-3 text-[0.95rem] shadow-sm flex flex-col gap-2 ${
                  isMine 
                    ? 'self-end bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'self-start bg-surface border border-border text-text rounded-2xl rounded-tl-sm'
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {msg.mediaUrl && (
                  <div className="rounded-xl overflow-hidden mt-1 mb-1">
                    {msg.mediaType === 'video' ? (
                      <video src={msg.mediaUrl} controls className="max-w-full max-h-[300px] object-cover" />
                    ) : (
                      <img src={msg.mediaUrl} alt="attachment" className="max-w-full max-h-[300px] object-cover" />
                    )}
                  </div>
                )}
                {msg.text && <span>{msg.text}</span>}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface/80 backdrop-blur-md border-t border-border flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-surface border border-border p-2 rounded-lg w-fit">
            <span className="text-sm text-text truncate max-w-[200px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer">✕</button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="flex-1 bg-background/80 border border-border rounded-3xl flex items-center px-2 py-1 shadow-inner focus-within:border-primary/50 transition">
            
            <label className="cursor-pointer p-2 text-xl hover:scale-110 transition opacity-80 hover:opacity-100 flex items-center justify-center">
              📎
              <input 
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </label>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none text-text py-3 px-2 focus:outline-none"
              disabled={isUploading}
            />
          </div>
          <button 
            type="submit" 
            disabled={(!inputText.trim() && !selectedFile) || isUploading}
            className="bg-primary text-white h-12 px-6 rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
