import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSAM_DISTRICTS } from '../utils/districts';
import { Search, Calendar, Landmark, Sparkles, Filter, Heart, X, ArrowRight, Share2 } from 'lucide-react';
import { fetchAllContent } from '../services/api';

const Library: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [activeTab, setActiveTab] = useState<'Events' | 'Festivals' | 'Tourist Places'>('Festivals');
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  useEffect(() => {
    loadPosts();
    const saved = JSON.parse(localStorage.getItem('itinerary') || '[]');
    setItinerary(saved);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllContent();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItinerary = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    let newItinerary;
    if (itinerary.includes(postId)) {
      newItinerary = itinerary.filter(i => i !== postId);
    } else {
      newItinerary = [...itinerary, postId];
    }
    setItinerary(newItinerary);
    localStorage.setItem('itinerary', JSON.stringify(newItinerary));
  };

  const filteredPosts = posts.filter(post => 
    (selectedDistrict === 'all' || post.district.toLowerCase() === selectedDistrict.toLowerCase()) &&
    post.category.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-40 pb-20 px-6 bg-[#fdfcf7]"
    >
      <div className="container mx-auto">
        <header className="mb-16">
          <h1 className="text-6xl font-black text-amber-900 mb-4 tracking-tighter">The Library</h1>
          <p className="text-xl text-stone-500 font-medium max-w-2xl">
            A curated collection of Assam's living heritage. Select a district and dive into its stories.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-12">
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-700" size={18} />
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm font-bold text-amber-900 focus:ring-4 focus:ring-amber-100 appearance-none min-w-[240px]"
              >
                <option value="all">All Districts</option>
                {ASSAM_DISTRICTS.map(d => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-stone-100 p-1.5 rounded-2xl flex gap-1">
            {(['Festivals', 'Events', 'Tourist Places'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab 
                  ? 'bg-white text-amber-900 shadow-md scale-105' 
                  : 'text-stone-500 hover:text-amber-800'
                }`}
              >
                {tab === 'Festivals' && <Sparkles size={18} />}
                {tab === 'Events' && <Calendar size={18} />}
                {tab === 'Tourist Places' && <Landmark size={18} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="col-span-full py-20 text-center font-bold text-stone-400">Loading stories...</div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layoutId={`lib-card-${post.id}`}
                  onClick={() => setSelectedStory(post)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 group hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  <motion.div layoutId={`lib-image-${post.id}`} className="relative h-72 overflow-hidden">
                    <img 
                      src={post.media_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <button 
                      onClick={(e) => handleToggleItinerary(e, post.id)}
                      className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition ${
                        itinerary.includes(post.id) ? 'bg-amber-600 text-white shadow-lg' : 'bg-black/20 text-white hover:bg-black/40'
                      }`}
                    >
                      <Heart size={20} fill={itinerary.includes(post.id) ? "currentColor" : "none"} />
                    </button>

                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/30 capitalize">
                        {post.district}
                      </div>
                    </div>
                  </motion.div>
                  <div className="p-8">
                    <motion.h3 layoutId={`lib-title-${post.id}`} className="text-2xl font-black text-stone-900 mb-3 leading-tight">{post.title}</motion.h3>
                    <p className="text-stone-500 font-medium leading-relaxed mb-6 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-widest">
                      <span>Read Story</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full py-40 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-stone-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                  <Search size={40} />
                </div>
                <h3 className="text-3xl font-black text-stone-900 mb-2">No entries found</h3>
                <p className="text-stone-500 font-medium">Try another district or category to discover something new.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Expanded Story View */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              layoutId={`lib-card-${selectedStory.id}`}
              className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <motion.div layoutId={`lib-image-${selectedStory.id}`} className="w-full md:w-3/5 h-[40vh] md:h-auto bg-stone-900 relative">
                {selectedStory.type === 'video' ? (
                  <video src={selectedStory.media_url} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <img src={selectedStory.media_url} alt={selectedStory.title} className="w-full h-full object-cover" />
                )}
                <button onClick={() => setSelectedStory(null)} className="absolute top-6 left-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition md:hidden">
                  <X size={20} />
                </button>
              </motion.div>

              <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto bg-[#fdfcf7]">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {selectedStory.category}
                  </div>
                  <button onClick={() => setSelectedStory(null)} className="hidden md:block text-stone-300 hover:text-stone-900 transition">
                    <X size={24} />
                  </button>
                </div>

                <motion.h3 layoutId={`lib-title-${selectedStory.id}`} className="text-4xl md:text-5xl font-black text-stone-900 mb-6 tracking-tighter leading-none">
                  {selectedStory.title}
                </motion.h3>

                <div className="flex items-center gap-4 mb-8 text-stone-400">
                  <span className="text-sm font-bold uppercase tracking-widest">{selectedStory.district}</span>
                  <span className="text-stone-200">|</span>
                  <span className="text-sm font-bold capitalize">By {selectedStory.contributor}</span>
                </div>

                <p className="text-stone-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedStory.description}
                </p>

                <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-between">
                  <button 
                    onClick={(e) => handleToggleItinerary(e, selectedStory.id)}
                    className={`flex items-center gap-2 font-black text-sm uppercase tracking-widest transition ${
                      itinerary.includes(selectedStory.id) ? 'text-amber-600' : 'text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <Heart size={20} fill={itinerary.includes(selectedStory.id) ? "currentColor" : "none"} />
                    {itinerary.includes(selectedStory.id) ? 'Saved' : 'Save'}
                  </button>
                  <button className="p-3 text-stone-400 hover:text-stone-900 transition">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Library;
