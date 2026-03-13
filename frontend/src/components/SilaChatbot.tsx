import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, Minimize2, Maximize2, MapPin } from 'lucide-react';
import { getSilaResponse } from '../services/groq';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      // Add district context if present
      const currentDistrict = districtId ? `The user is currently viewing information about ${districtId}.` : '';
      const response = await getSilaResponse(chatHistory, currentDistrict);
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
        className="fixed bottom-6 right-6 p-4 bg-amber-600 text-white rounded-full shadow-2xl z-50 flex items-center justify-center border-2 border-white/20"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border border-white/50"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed right-6 bottom-24 w-[350px] md:w-[400px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-100 transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 bg-amber-600 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center border-2 border-amber-400">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">Sila</h3>
                  <p className="text-xs text-amber-200 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online Guide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-amber-500 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-amber-500 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          msg.role === 'user' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          msg.role === 'user' 
                            ? 'bg-amber-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex gap-2 max-w-[85%] items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Bot size={16} className="text-gray-600" />
                        </div>
                        <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-gray-100">
                          <Loader2 size={20} className="animate-spin text-amber-600" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl items-center">
                    <textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask Sila anything about Assam..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none max-h-32 text-gray-800"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        input.trim() && !isLoading ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      <Send size={20} />
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-medium">
                    Powered by Groq • Llama 3.3
                  </p>
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
