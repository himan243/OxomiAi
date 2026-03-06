import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllContent } from '../services/api';

const Itinerary: React.FC = () => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItinerary();
  }, []);

  const loadItinerary = async () => {
    setLoading(true);
    try {
      const allContent = await fetchAllContent();
      const savedIds = JSON.parse(localStorage.getItem('itinerary') || '[]');
      const filtered = allContent.filter((item: any) => savedIds.includes(item.id));
      setSavedItems(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromItinerary = (id: string) => {
    const savedIds = JSON.parse(localStorage.getItem('itinerary') || '[]');
    const newIds = savedIds.filter((i: string) => i !== id);
    localStorage.setItem('itinerary', JSON.stringify(newIds));
    setSavedItems(savedItems.filter(item => item.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-40 pb-20 px-6 bg-[#fdfcf7]"
    >
      <div className="container mx-auto max-w-4xl">
        <header className="mb-16">
          <div className="flex items-center gap-3 text-amber-600 font-black tracking-widest uppercase text-sm mb-4">
            <Heart size={18} fill="currentColor" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-6xl font-black text-stone-900 mb-4 tracking-tighter">My Itinerary</h1>
          <p className="text-xl text-stone-500 font-medium">Your curated journey through the soul of Assam.</p>
        </header>

        {loading ? (
          <div className="py-20 text-center font-bold text-stone-400 text-2xl">Consulting the maps...</div>
        ) : savedItems.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {savedItems.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group"
                >
                  <div className="w-full md:w-64 h-48 rounded-[2rem] overflow-hidden flex-shrink-0">
                    <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest mb-2">
                        <MapPin size={14} />
                        <span>{item.district}</span>
                        <span className="mx-2 text-stone-300">•</span>
                        <span>{item.category}</span>
                      </div>
                      <h3 className="text-3xl font-black text-stone-900 mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-stone-500 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <Link to={`/district/${item.district.toLowerCase()}`} className="inline-flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
                        Visit District
                        <ArrowRight size={18} />
                      </Link>
                      <button 
                        onClick={() => removeFromItinerary(item.id)}
                        className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-stone-200">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
              <Heart size={40} />
            </div>
            <h3 className="text-3xl font-black text-stone-900 mb-2">Your journey is a blank canvas</h3>
            <p className="text-stone-500 font-medium mb-10 max-w-md mx-auto">Start exploring the map and heart your favorite spots to build your personal Assamese itinerary.</p>
            <Link to="/" className="inline-flex items-center gap-3 bg-amber-800 text-white px-10 py-5 rounded-full font-black hover:bg-amber-900 transition shadow-xl">
              Open the Map
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Itinerary;
