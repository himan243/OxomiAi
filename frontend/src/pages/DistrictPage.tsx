import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronLeft, MapPin, Camera, Heart, CheckCircle2, FileVideo, ImageIcon, X, ArrowRight, Share2, Calendar } from 'lucide-react';
import { fetchDistrictContent, submitContent } from '../services/api';

const DistrictPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'festivals'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadContent();
    }
    const saved = JSON.parse(localStorage.getItem('itinerary') || '[]');
    setItinerary(saved);
  }, [id]);

  const loadContent = async () => {
    try {
      const data = await fetchDistrictContent(id!);
      setContent(data);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a photo or video');

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('district', id || '');
      data.append('media', selectedFile);
      data.append('contributor', 'Guest User');

      await submitContent(data);
      setSubmitted(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setSubmitted(false);
        setFormData({ title: '', description: '', category: 'festivals' });
        setSelectedFile(null);
      }, 2000);
    } catch (err) {
      alert('Failed to submit story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['all', 'festivals', 'food', 'craft', 'heritage', 'hidden gems'];
  const filteredContent = content.filter(item => 
    activeTab === 'all' || item.category.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#fdfcf7]"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('/bgr/u-2.png')] bg-cover bg-fixed bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfcf7] via-transparent to-black/40"></div>

        
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20">
          <Link to="/" className="flex items-center text-white/90 hover:text-white mb-8 transition group w-fit">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md group-hover:bg-white/20 transition mr-3">
              <ChevronLeft size={20} />
            </div>
            <span className="font-bold tracking-widest uppercase text-sm">Back to Map</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center text-amber-400 font-black tracking-[0.3em] uppercase text-xs mb-4">
                <MapPin size={14} className="mr-2" />
                <span>Territory Exploration</span>
              </div>
              <h2 className="text-7xl md:text-9xl font-black text-white capitalize tracking-tighter drop-shadow-2xl">{id}</h2>
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-stone-900 px-10 py-5 rounded-full font-black shadow-2xl flex items-center gap-3 hover:bg-amber-50 transition border-none"
            >
              <Camera size={24} className="text-amber-600" />
              Contribute Media
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-wrap items-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-3 rounded-2xl font-black transition-all capitalize text-sm tracking-widest ${
                activeTab === cat 
                ? 'bg-amber-800 text-white shadow-xl scale-105' 
                : 'text-stone-400 hover:text-amber-800 bg-white shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <motion.div 
                  key={item.id}
                  layoutId={`story-${item.id}`}
                  onClick={() => setSelectedStory(item)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-100 group cursor-pointer hover:shadow-2xl transition-all duration-500 relative"
                >
                  <motion.div layoutId={`media-${item.id}`} className="relative h-80 overflow-hidden bg-stone-100">
                    {item.type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <button 
                      onClick={(e) => handleToggleItinerary(e, item.id)}
                      className={`absolute top-6 right-6 p-4 rounded-full backdrop-blur-xl transition-all duration-300 ${
                        itinerary.includes(item.id) ? 'bg-amber-600 text-white shadow-lg scale-110' : 'bg-white/20 text-white hover:bg-white hover:text-amber-600'
                      }`}
                    >
                      <Heart size={20} fill={itinerary.includes(item.id) ? "currentColor" : "none"} />
                    </button>
                  </motion.div>
                  <div className="p-10">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{item.category}</span>
                    <motion.h3 layoutId={`title-${item.id}`} className="text-3xl font-black text-stone-900 mt-3 leading-tight tracking-tighter">{item.title}</motion.h3>
                    <p className="text-stone-500 text-sm mt-4 line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                    <div className="mt-8 pt-8 border-t border-stone-50 flex items-center justify-between">
                      <span className="text-stone-300 font-bold text-[10px] uppercase tracking-widest">By {item.contributor}</span>
                      <ArrowRight size={18} className="text-amber-800 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                  <Upload size={32} className="text-stone-200" />
                </div>
                <h3 className="text-3xl font-black text-stone-900 mb-2 tracking-tight">The story is yet to be told</h3>
                <p className="text-stone-400 font-medium mb-10 max-w-xs mx-auto">Be the first to document the cultural heritage of {id}.</p>
                <button onClick={() => setShowUploadModal(true)} className="bg-amber-800 text-white px-10 py-4 rounded-full font-black hover:bg-amber-900 transition shadow-xl">Start documenting {id}</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cinematic Expanded View */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStory(null)} className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"></motion.div>
            
            <motion.div 
              layoutId={`story-${selectedStory.id}`}
              className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <motion.div layoutId={`media-${selectedStory.id}`} className="w-full md:w-3/5 h-[45vh] md:h-auto bg-stone-900 relative">
                {selectedStory.type === 'video' ? (
                  <video src={selectedStory.media_url} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <img src={selectedStory.media_url} alt={selectedStory.title} className="w-full h-full object-cover" />
                )}
                <button onClick={() => setSelectedStory(null)} className="absolute top-8 left-8 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all md:hidden"><X size={24} /></button>
              </motion.div>

              <div className="w-full md:w-2/5 p-10 md:p-16 overflow-y-auto bg-[#fdfcf7] flex flex-col">
                <div className="flex justify-between items-start mb-12">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                    <ImageIcon size={12} />
                    {selectedStory.category}
                  </div>
                  <button onClick={() => setSelectedStory(null)} className="hidden md:flex p-2 text-stone-300 hover:text-stone-900 transition hover:bg-stone-100 rounded-full"><X size={28} /></button>
                </div>

                <motion.h3 layoutId={`title-${selectedStory.id}`} className="text-5xl md:text-6xl font-black text-stone-900 mb-8 tracking-tighter leading-[0.9]">
                  {selectedStory.title}
                </motion.h3>

                <div className="flex flex-wrap items-center gap-6 mb-10 text-stone-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-800 font-black text-xs">
                      {selectedStory.contributor?.[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-0.5">Contributor</p>
                      <p className="text-sm font-bold text-stone-900 uppercase tracking-tight">{selectedStory.contributor}</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-stone-100 mx-2 hidden sm:block"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-0.5">Published</p>
                      <p className="text-sm font-bold text-stone-900 uppercase tracking-tight">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-stone-600 text-xl font-medium leading-relaxed whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-amber-800 first-letter:mr-2 first-letter:float-left">
                    {selectedStory.description}
                  </p>
                </div>

                <div className="mt-12 pt-10 border-t border-stone-100 flex items-center justify-between">
                  <button 
                    onClick={(e) => handleToggleItinerary(e, selectedStory.id)}
                    className={`flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all py-4 px-8 rounded-2xl ${
                      itinerary.includes(selectedStory.id) ? 'bg-amber-600 text-white shadow-xl scale-105' : 'bg-white text-stone-400 hover:text-amber-800 shadow-sm border border-stone-100'
                    }`}
                  >
                    <Heart size={18} fill={itinerary.includes(selectedStory.id) ? "currentColor" : "none"} />
                    {itinerary.includes(selectedStory.id) ? 'Saved' : 'Add to Journey'}
                  </button>
                  <button className="p-4 bg-white text-stone-400 hover:text-stone-900 transition shadow-sm border border-stone-100 rounded-2xl"><Share2 size={20} /></button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowUploadModal(false)} className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-12 overflow-hidden border border-stone-100">
              <div className="absolute top-0 left-0 w-full h-3 bg-amber-600"></div>
              
              {submitted ? (
                <div className="py-16 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h3 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter">Story Shared!</h3>
                  <p className="text-stone-500 font-medium text-lg">Your discovery is now being reviewed by the elders in the moderation vault.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-4xl font-black text-stone-900 tracking-tighter leading-none">Share a <span className="text-amber-600">Discovery</span></h3>
                    <button onClick={() => setShowUploadModal(false)} className="p-2 text-stone-300 hover:text-stone-900 transition"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group border-4 border-dashed border-stone-50 rounded-[2rem] p-10 text-center hover:border-amber-200 transition-all cursor-pointer bg-stone-50/50">
                      <input 
                        required
                        type="file" 
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="flex flex-col items-center">
                        {selectedFile ? (
                          <div className="flex items-center gap-3 text-amber-700 bg-white px-6 py-3 rounded-2xl shadow-sm font-black text-sm uppercase tracking-widest">
                            {selectedFile.type.startsWith('video') ? <FileVideo size={20}/> : <ImageIcon size={20}/>}
                            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Upload size={28} className="text-amber-600" />
                            </div>
                            <p className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Drop Media (Photo/Video)</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input required type="text" placeholder="Title of the story" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-black text-stone-900 tracking-tight transition-all border border-stone-100" />
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none font-black text-stone-900 capitalize border border-stone-100">
                        {categories.filter(c => c !== 'all').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <textarea required placeholder="Write the cultural significance here..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-medium text-stone-700 h-40 transition-all border border-stone-100 resize-none"></textarea>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button type="submit" disabled={isSubmitting} className="w-full bg-amber-800 text-white rounded-2xl py-6 font-black hover:bg-amber-900 transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest text-sm">
                        {isSubmitting ? 'Uploading to vault...' : 'Complete Contribution'}
                      </button>
                    </div>
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

export default DistrictPage;
