import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSAM_DISTRICTS } from '../utils/districts';
import { 
  Search, Calendar, Landmark, Sparkles, Filter, Heart, X, ArrowRight, Share2, 
  Utensils, Palette, History, Map as MapIcon, ImageIcon, ChevronRight, Edit3, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { fetchAllContent, suggestEdit } from '../services/api';

const Library: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [activeTab, setActiveTab] = useState<string>('Festivals');
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Edit Suggestion states
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: ''
  });

  const categories = [
    { name: 'Festivals', icon: Sparkles },
    { name: 'Events', icon: Calendar },
    { name: 'Tourist Places', icon: Landmark },
    { name: 'Food', icon: Utensils },
    { name: 'Craft', icon: Palette },
    { name: 'Heritage', icon: History },
    { name: 'Hidden Gems', icon: MapIcon }
  ];

  useEffect(() => {
    loadPosts();
    const saved = JSON.parse(localStorage.getItem('itinerary') || '[]');
    setItinerary(saved);
  }, []);

  useEffect(() => {
    if (selectedStory || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStory, showEditModal]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllContent();
      // Group items by their parent or if they are a parent
      const parents = data.filter((item: any) => !item.parent_id);
      const children = data.filter((item: any) => item.parent_id);

      const grouped = parents.map((parent: any) => ({
        ...parent,
        media_items: [parent, ...children.filter((child: any) => child.parent_id === parent.id)]
      }));

      setPosts(grouped || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentMediaIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      setCurrentMediaIndex(index);
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

  const handleSuggestEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;

    console.log("Submitting edit for story ID (Library):", selectedStory.id);
    setIsSubmitting(true);
    try {
      const result = await suggestEdit(selectedStory.id, editFormData.title, editFormData.description);
      console.log("Suggestion submitted successfully (Library):", result);
      setSubmitted(true);
      setTimeout(() => {
        setShowEditModal(false);
        setSubmitted(false);
        setEditFormData({ title: '', description: '' });
      }, 2000);
    } catch (err) {
      console.error("Error submitting suggested edits (Library):", err);
      alert('Failed to suggest edits. Please check your connection or database schema.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditStory = (e: React.MouseEvent, story: any) => {
    e.stopPropagation();
    setEditFormData({
      title: story.title,
      description: story.description
    });
    setSubmitted(false);
    // Removed setSelectedStory(null) to keep it in background
    setShowEditModal(true);
  };

  const filteredPosts = posts.filter(post => 
    (selectedDistrict === 'all' || (post.district || '').toLowerCase() === selectedDistrict.toLowerCase()) &&
    (post.category || '').toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 md:pt-40 pb-20 px-4 md:px-6 bg-[#fdfcf7]"
    >
      <div className="container mx-auto">
        <header className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-amber-900 mb-4 tracking-tighter leading-none">The Library</h1>
          <p className="text-base md:text-xl text-stone-500 font-medium max-w-2xl leading-relaxed">
            A curated collection of Assam's living heritage. Select a district and dive into its stories.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center justify-between mb-10 md:mb-12">
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-700" size={18} />
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm font-bold text-amber-900 focus:ring-4 focus:ring-amber-100 appearance-none md:min-w-[240px]"
              >
                <option value="all">All Districts</option>
                {ASSAM_DISTRICTS.map(d => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-stone-100 p-1.5 rounded-2xl flex flex-wrap gap-1 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveTab(cat.name)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-sm whitespace-nowrap ${
                    activeTab === cat.name 
                    ? 'bg-white text-amber-900 shadow-md scale-105' 
                    : 'text-stone-500 hover:text-amber-800'
                  }`}
                >
                  <Icon size={16} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="col-span-full py-20 text-center font-bold text-stone-400">Loading stories...</div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layoutId={`lib-card-${post.id}`}
                  onClick={() => {
                    setSelectedStory(post);
                    setCurrentMediaIndex(0);
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 group hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  <motion.div layoutId={`lib-image-${post.id}`} className="relative h-64 md:h-72 overflow-hidden">
                    <img 
                      src={post.media_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      {post.media_items?.length > 1 && (
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30 flex items-center gap-1">
                          <ImageIcon size={12} />
                          {post.media_items.length} Photos
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => handleToggleItinerary(e, post.id)}
                      className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition ${
                        itinerary.includes(post.id) ? 'bg-amber-600 text-white shadow-lg' : 'bg-black/20 text-white hover:bg-black/40'
                      }`}
                    >
                      <Heart size={20} fill={itinerary.includes(post.id) ? "currentColor" : "none"} />
                    </button>

                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30 capitalize">
                        {post.district}
                      </div>
                    </div>
                  </motion.div>
                  <div className="p-6 md:p-8">
                    <motion.h3 layoutId={`lib-title-${post.id}`} className="text-xl md:text-2xl font-black text-stone-900 mb-3 leading-tight">{post.title}</motion.h3>
                    <p className="text-stone-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-widest">
                      <span>Read Story</span>
                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full py-20 md:py-40 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-stone-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                  <Search size={32} className="md:w-10 md:h-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-stone-900 mb-2">No entries found</h3>
                <p className="text-stone-500 font-medium">Try another district or category to discover something new.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Expanded Story View */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-2 md:p-10 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div 
              layoutId={`lib-card-${selectedStory.id}`}
              className="relative bg-white w-full max-w-7xl h-full md:h-[85vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <motion.div layoutId={`lib-image-${selectedStory.id}`} className="w-full md:w-[65%] h-[40vh] md:h-auto bg-stone-950 relative flex-shrink-0 group/media">
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                >
                  {selectedStory.media_items?.map((media: any, idx: number) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                      {media.type === 'video' ? (
                        <video src={media.media_url} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={media.media_url} alt={selectedStory.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {/* Media Navigation Dots */}
                {selectedStory.media_items?.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {selectedStory.media_items.map((_: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => scrollToIndex(idx)}
                        className={`h-1.5 transition-all rounded-full ${currentMediaIndex === idx ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                      ></button>
                    ))}
                  </div>
                )}

                {/* Scroll Arrows */}
                {selectedStory.media_items?.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <button 
                        onClick={() => scrollToIndex(currentMediaIndex - 1)}
                        className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-20 hidden md:block"
                      >
                        <ChevronLeft size={48} strokeWidth={1} />
                      </button>
                    )}
                    {currentMediaIndex < selectedStory.media_items.length - 1 && (
                      <button 
                        onClick={() => scrollToIndex(currentMediaIndex + 1)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-20 hidden md:block"
                      >
                        <ChevronRight size={48} strokeWidth={1} />
                      </button>
                    )}
                  </>
                )}

                <button onClick={() => setSelectedStory(null)} className="absolute top-6 left-6 p-4 bg-black/20 hover:bg-black/60 text-white rounded-full backdrop-blur-xl transition-all z-20"><X size={24} /></button>
                
                <div className="absolute bottom-8 left-8 flex items-center gap-4 z-20">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-sm uppercase">
                      {(selectedStory.media_items?.[currentMediaIndex]?.contributor?.[0] || 'G')}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Contributor</p>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">
                        {selectedStory.media_items?.[currentMediaIndex]?.contributor || 'Guest User'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="w-full md:w-[35%] p-8 md:p-14 overflow-y-auto bg-[#fdfcf7] flex flex-col border-l border-stone-100">
                <div className="flex justify-between items-start mb-8 md:mb-12">
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                    {selectedStory.category}
                  </div>
                  <button onClick={() => setSelectedStory(null)} className="hidden md:block text-stone-300 hover:text-stone-900 transition">
                    <X size={28} />
                  </button>
                </div>

                <div className="relative group/title mb-6 md:mb-8">
                  <motion.h3 layoutId={`lib-title-${selectedStory.id}`} className="text-3xl md:text-6xl font-black text-stone-900 tracking-tighter leading-[0.9]">
                    {selectedStory.title}
                  </motion.h3>
                  <button 
                    onClick={(e) => openEditStory(e, selectedStory)}
                    className="absolute -right-4 -top-4 opacity-0 group-hover/title:opacity-100 transition p-2 bg-white shadow-xl rounded-full text-amber-800 hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-8 text-stone-400">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{selectedStory.district}</span>
                </div>

                <div className="flex-1">
                  <div className="relative group/desc">
                    <p className="text-stone-600 text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap first-letter:text-4xl first-letter:font-black first-letter:text-amber-800 first-letter:mr-2 first-letter:float-left mb-8">
                      {selectedStory.description}
                    </p>
                    <button 
                      onClick={(e) => openEditStory(e, selectedStory)}
                      className="absolute right-0 bottom-0 opacity-0 group-hover/desc:opacity-100 transition p-3 bg-amber-50 text-amber-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-amber-100"
                    >
                      <Edit3 size={14} /> Suggest Changes
                    </button>
                  </div>
                </div>

                <div className="mt-8 md:mt-12 pt-8 border-t border-stone-100 flex items-center justify-between pb-4">
                  <button 
                    onClick={(e) => handleToggleItinerary(e, selectedStory.id)}
                    className={`flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition py-4 px-8 rounded-2xl ${
                      itinerary.includes(selectedStory.id) ? 'bg-amber-600 text-white shadow-xl' : 'bg-white text-stone-400 border border-stone-100 hover:text-amber-800'
                    }`}
                  >
                    <Heart size={20} fill={itinerary.includes(selectedStory.id) ? "currentColor" : "none"} />
                    {itinerary.includes(selectedStory.id) ? 'Saved' : 'Save'}
                  </button>
                  <button className="p-4 bg-white text-stone-400 border border-stone-100 rounded-2xl hover:text-stone-900 transition">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Suggestion Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowEditModal(false)} className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full max-w-xl p-8 md:p-12 overflow-hidden border border-stone-100 max-h-[95vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-stone-900"></div>
              
              {submitted ? (
                <div className="py-12 md:py-16 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 md:w-24 md:h-24 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tighter">Edit Suggested!</h3>
                  <p className="text-stone-500 font-medium text-base md:text-lg">The moderators will review your suggested improvements.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8 md:mb-10">
                    <h3 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter leading-none">Suggest <span className="text-amber-600">Edits</span></h3>
                    <button onClick={() => setShowEditModal(false)} className="p-2 text-stone-300 hover:text-stone-900 transition"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleSuggestEdit} className="space-y-4 md:space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Title Improvement</label>
                        <input required type="text" placeholder="Title of the story" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full bg-stone-50 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 outline-none focus:ring-4 focus:ring-amber-100 font-black text-stone-900 tracking-tight transition-all border border-stone-100 text-sm md:text-base" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Description Improvement</label>
                        <textarea required placeholder="Write the improved cultural significance here..." value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} className="w-full bg-stone-50 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 outline-none focus:ring-4 focus:ring-amber-100 font-medium text-stone-700 h-48 md:h-60 transition-all border border-stone-100 resize-none text-sm md:text-base"></textarea>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white rounded-xl md:rounded-2xl py-5 md:py-6 font-black hover:bg-stone-800 transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest text-[10px] md:text-sm">
                      {isSubmitting ? 'Submitting Improvements...' : 'Send Suggested Edits'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Library;
