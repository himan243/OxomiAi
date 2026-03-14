import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { getSilaResponse } from '../services/groq';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Custom Kite Bird Component
const KiteBird = ({ state }: { state: 'floating' | 'seated' | 'flying' }) => {
  return (
    <motion.div
      animate={state === 'flying' ? {
        y: [0, -10, 0],
        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
      } : {}}
      className="relative flex items-center justify-center"
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        {/* Body */}
        <motion.path
          d="M12 18C14.2091 18 16 16.2091 16 14C16 11.7909 14.2091 10 12 10C9.79086 10 8 11.7909 8 14C8 16.2091 9.79086 18 12 18Z"
          fill="currentColor"
          animate={state === 'flying' ? { scaleY: 0.9 } : { scaleY: 1 }}
        />
        {/* Head */}
        <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" fill="currentColor" />
        <path d="M13.5 7.5L15 8L13.5 8.5V7.5Z" fill="#FCD34D" /> {/* Beak */}
        
        {/* Wings */}
        <motion.path
          d={state === 'flying' 
            ? "M8 12C4 10 2 14 2 14C2 14 4 15 8 14" 
            : "M8 12C7 14 7 16 8 17"
          }
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={state === 'flying' ? {
            rotate: [0, -20, 0],
            originX: "100%",
            transition: { repeat: Infinity, duration: 0.8 }
          } : { rotate: 0 }}
        />
        <motion.path
          d={state === 'flying' 
            ? "M16 12C20 10 22 14 22 14C22 14 20 15 16 14" 
            : "M16 12C17 14 17 16 16 17"
          }
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={state === 'flying' ? {
            rotate: [0, 20, 0],
            originX: "0%",
            transition: { repeat: Infinity, duration: 0.8 }
          } : { rotate: 0 }}
        />
        
        {/* Tail */}
        <path d="M11 18L10 21H14L13 18H11Z" fill="currentColor" opacity="0.8" />
      </svg>
    </motion.div>
  );
};

const SilaChatbot: React.FC = () => {
  const location = useLocation();
  const districtId = location.pathname.startsWith('/district/') ? location.pathname.split('/')[2] : null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Small timeout to ensure the DOM has rendered after animation
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const filteredHistory = messages
        .filter(m => 
          m.content !== "I'm having a bit of trouble connecting right now." &&
          m.content !== "I'm sorry, I'm having some trouble connecting right now. Can you try again?" &&
          !m.content.startsWith("Oops! I'm having a little trouble")
        )
        .slice(-6);

      const chatHistory = [...filteredHistory, userMessage].map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const response = await getSilaResponse(chatHistory, districtId);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, I'm having some trouble connecting right now. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: "Namaste! I'm Sila, your guide to the beautiful land of Assam. How can I help you today?" }]);
          }
        }}
        className="fixed bottom-6 right-6 p-3 bg-amber-600 text-white rounded-full shadow-2xl z-50 flex items-center justify-center border-2 border-white/20 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="bird" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <KiteBird state="floating" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border border-white/50"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '550px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-6 bottom-24 w-[350px] md:w-[400px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col border border-stone-200"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-amber-700 to-amber-600 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                 <KiteBird state="flying" />
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <KiteBird state={isLoading ? "flying" : "seated"} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-none uppercase">Sila</h3>
                  <p className="text-[10px] text-amber-200 mt-1.5 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                    Guardian of Lore
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#fdfcf7]">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                          msg.role === 'user' ? 'bg-amber-100 text-amber-800' : 'bg-white text-amber-700 border border-amber-100'
                        }`}>
                          {msg.role === 'user' ? <User size={16} /> : <KiteBird state="seated" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-amber-700 text-white rounded-tr-none font-medium' 
                            : 'bg-white text-stone-800 rounded-tl-none border border-stone-100 italic font-serif'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%] items-center">
                        <div className="w-8 h-8 rounded-xl bg-white border border-amber-100 flex items-center justify-center shadow-sm">
                           <KiteBird state="flying" />
                        </div>
                        <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-stone-100 shadow-sm flex items-center gap-2">
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-widest animate-pulse">Sila is flying...</span>
                          <Loader2 size={14} className="animate-spin text-amber-600" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white border-t border-stone-100">
                  <div className="flex gap-3 p-2 bg-stone-50 rounded-2xl items-center border border-stone-100 focus-within:border-amber-300 transition-all shadow-inner">
                    <textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask Sila about Assam's heritage..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none max-h-32 text-stone-800 placeholder-stone-400 font-medium"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: '#b45309' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`p-3 rounded-xl transition-all shadow-md ${
                        input.trim() && !isLoading ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-black">
                      Kite Guardian • Llama 3.1
                    </p>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-amber-300"></div>
                      <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                      <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SilaChatbot;
