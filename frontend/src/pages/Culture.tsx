import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, ChevronLeft, Sparkles, Camera, Heart, CheckCircle2, 
  FileVideo, ImageIcon, X, ArrowRight, Share2, Plus, Edit3, 
  User, ChevronRight, Utensils, Palette, History, Music, Landmark
} from 'lucide-react';
import { fetchDistrictContent, submitContent, suggestEdit } from '../services/api';

const CulturePage: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const categories = [
    { name: 'all', icon: Sparkles },
    { name: 'bihu', icon: Music },
    { name: 'festivals', icon: Sparkles },
    { name: 'heritage', icon: Landmark },
    { name: 'cuisine', icon: Utensils },
    { name: 'folklore', icon: History },
    { name: 'crafts', icon: Palette },
    { name: 'attire', icon: User }
  ];

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'festivals',
    contributor: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadParentId, setUploadParentId] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
    const saved = JSON.parse(localStorage.getItem('itinerary') || '[]');
    setItinerary(saved);

    // Handle initial category from URL
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && categories.some(c => c.name === cat.toLowerCase())) {
      setActiveTab(cat.toLowerCase());
    }
  }, [location.search]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedStory(null);
        setShowUploadModal(false);
        setShowEditModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (selectedStory || showUploadModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStory, showUploadModal, showEditModal]);

  const loadContent = async () => {
    try {
      // Use 'unbounded' as the district identifier for location-independent cultural content
      const data = await fetchDistrictContent('unbounded');
      
      // Group items by their parent or if they are a parent
      const parents = data.filter((item: any) => !item.parent_id);
      const children = data.filter((item: any) => item.parent_id);

      const grouped = parents.map((parent: any) => ({
        ...parent,
        media_items: [parent, ...children.filter((child: any) => child.parent_id === parent.id)]
      }));

      setContent(grouped || []);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !uploadParentId) return alert('Please select a photo or video');

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('district', 'unbounded');
      if (selectedFile) data.append('media', selectedFile);
      data.append('contributor', formData.contributor || 'Guest User');
      if (uploadParentId) data.append('parentId', uploadParentId);

      await submitContent(data);
      setSubmitted(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setSubmitted(false);
        setFormData({ title: '', description: '', category: 'festivals', contributor: '' });
        setSelectedFile(null);
        setUploadParentId(null);
        loadContent(); // Refresh content
      }, 2000);
    } catch (err) {
      alert('Failed to submit story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;

    setIsSubmitting(true);
    try {
      await suggestEdit(selectedStory.id, editFormData.title, editFormData.description);
      setSubmitted(true);
      setTimeout(() => {
        setShowEditModal(false);
        setSubmitted(false);
        setEditFormData({ title: '', description: '' });
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to suggest edits.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddPhoto = (e: React.MouseEvent, story: any) => {
    e.stopPropagation();
    setUploadParentId(story.id);
    setFormData({
      ...formData,
      title: story.title,
      description: story.description,
      category: story.category
    });
    setSubmitted(false);
    setShowUploadModal(true);
  };

  const openEditStory = (e: React.MouseEvent, story: any) => {
    e.stopPropagation();
    setEditFormData({
      title: story.title,
      description: story.description
    });
    setSubmitted(false);
    setShowEditModal(true);
  };

  const filteredContent = content.filter(item => 
    activeTab === 'all' || (item.category || '').toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#fdfcf7]"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] bg-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('/bgr/bihu.jpg')] bg-cover bg-fixed bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfcf7] via-transparent to-black/60"></div>
        
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20 text-center md:text-left">
          <Link to="/" className="flex items-center text-white/90 hover:text-white mb-6 md:mb-8 transition group w-fit mx-auto md:mx-0">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md group-hover:bg-white/20 transition mr-3">
              <ChevronLeft size={20} />
            </div>
            <span className="font-bold tracking-widest uppercase text-xs md:text-sm">Back to Map</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-3xl">
              <div className="flex items-center justify-center md:justify-start text-amber-400 font-black tracking-[0.3em] uppercase text-[10px] mb-2 md:mb-4">
                <Sparkles size={14} className="mr-2" />
                <span>The Soul of Assam</span>
              </div>
              <h2 className="text-5xl md:text-9xl font-black text-white capitalize tracking-tighter drop-shadow-2xl leading-none">Culture</h2>
              <p className="text-white/80 mt-6 text-lg md:text-xl font-medium leading-relaxed max-w-2xl drop-shadow-lg">
                Explore the traditions, festivals, and heritage that define the spirit of Assam, 
                beyond the boundaries of any single district.
              </p>
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setUploadParentId(null);
                setFormData({ title: '', description: '', category: 'festivals', contributor: '' });
                setShowUploadModal(true);
              }}
              className="bg-white text-stone-900 px-6 md:px-10 py-4 md:py-5 rounded-full font-black shadow-2xl flex items-center gap-3 hover:bg-amber-50 transition border-none text-sm md:text-base w-fit mx-auto md:mx-0"
            >
              <Camera size={20} className="text-amber-600" />
              Share a Tradition
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-10 md:mb-16">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveTab(cat.name)}
                className={`px-4 md:px-6 py-3 rounded-2xl font-black transition-all capitalize text-[10px] md:text-sm tracking-widest flex items-center gap-2 ${
                  activeTab === cat.name 
                  ? 'bg-amber-800 text-white shadow-xl scale-105' 
                  : 'text-stone-400 hover:text-amber-800 bg-white shadow-sm border border-stone-50'
                }`}
              >
                <Icon size={16} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <AnimatePresence>
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <motion.div 
                  key={item.id}
                  layoutId={`story-${item.id}`}
                  onClick={() => {
                    setSelectedStory(item);
                    setCurrentMediaIndex(0);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-100 group cursor-pointer hover:shadow-2xl transition-all duration-500 relative"
                >
                  <motion.div layoutId={`media-${item.id}`} className="relative h-64 md:h-80 overflow-hidden bg-stone-100">
                    {item.type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="flex gap-2">
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase flex items-center gap-1">
                          <ImageIcon size={12} />
                          {item.media_items?.length || 1} Perspectives
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleToggleItinerary(e, item.id)}
                      className={`absolute top-6 right-6 p-4 rounded-full backdrop-blur-xl transition-all duration-300 ${
                        itinerary.includes(item.id) ? 'bg-amber-600 text-white shadow-lg scale-110' : 'bg-white/20 text-white hover:bg-white hover:text-amber-600'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={itinerary.includes(item.id) ? "currentColor" : "none"} />
                    </button>
                  </motion.div>
                  <div className="p-8 md:p-10">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{item.category}</span>
                    <motion.h3 layoutId={`title-${item.id}`} className="text-2xl md:text-3xl font-black text-stone-900 mt-3 leading-tight tracking-tighter">{item.title}</motion.h3>
                    <p className="text-stone-500 text-sm mt-4 line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                    <div className="mt-8 pt-8 border-t border-stone-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-stone-300 font-bold text-[10px] uppercase tracking-widest">Story by</span>
                        <span className="text-stone-600 font-black text-xs uppercase tracking-tight">{item.contributor}</span>
                      </div>
                      <ArrowRight size={18} className="text-amber-800 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 md:py-32 text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-stone-200" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-stone-900 mb-2 tracking-tight">The tapestry of Assam is vast</h3>
                <p className="text-stone-400 font-medium mb-10 max-w-xs mx-auto text-sm md:text-base">Be the first to share a location-independent tradition or festival.</p>
                <button onClick={() => {
                  setUploadParentId(null);
                  setShowUploadModal(true);
                }} className="bg-amber-800 text-white px-10 py-4 rounded-full font-black hover:bg-amber-900 transition shadow-xl text-sm md:text-base">Document a Tradition</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded Story View */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-2 md:p-12 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStory(null)} className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"></motion.div>
            
            <motion.div 
              layoutId={`story-${selectedStory.id}`}
              className="relative bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <motion.div layoutId={`media-${selectedStory.id}`} className="w-full md:w-[65%] h-[45vh] md:h-auto bg-stone-950 relative flex-shrink-0 group/media">
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

                {selectedStory.media_items?.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <button onClick={() => scrollToIndex(currentMediaIndex - 1)} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-20 hidden md:block">
                        <ChevronLeft size={48} strokeWidth={1} />
                      </button>
                    )}
                    {currentMediaIndex < selectedStory.media_items.length - 1 && (
                      <button onClick={() => scrollToIndex(currentMediaIndex + 1)} className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-20 hidden md:block">
                        <ChevronRight size={48} strokeWidth={1} />
                      </button>
                    )}
                  </>
                )}

                <button onClick={() => setSelectedStory(null)} className="absolute top-6 left-6 md:top-10 md:left-10 p-4 bg-black/20 hover:bg-black/60 text-white rounded-full backdrop-blur-xl transition-all z-20"><X className="w-6 h-6" /></button>
                
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex items-center gap-4 z-20">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-sm">
                      {selectedStory.media_items?.[currentMediaIndex]?.contributor?.[0] || 'G'}
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

              <div className="w-full md:w-[35%] p-8 md:p-16 overflow-y-auto bg-[#fdfcf7] flex flex-col border-l border-stone-100">
                <div className="flex justify-between items-start mb-10 md:mb-14">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                    <ImageIcon size={14} />
                    {selectedStory.category}
                  </div>
                  <button onClick={() => setSelectedStory(null)} className="hidden md:flex p-2 text-stone-300 hover:text-stone-900 transition hover:bg-stone-100 rounded-full"><X size={32} /></button>
                </div>

                <div className="relative group/title mb-8 md:mb-10">
                  <motion.h3 layoutId={`title-${selectedStory.id}`} className="text-4xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[0.85]">
                    {selectedStory.title}
                  </motion.h3>
                  <button 
                    onClick={(e) => openEditStory(e, selectedStory)}
                    className="absolute -right-4 -top-4 opacity-0 group-hover/title:opacity-100 transition p-2 bg-white shadow-xl rounded-full text-amber-800 hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="relative group/desc">
                    <p className="text-stone-600 text-lg md:text-2xl font-medium leading-relaxed whitespace-pre-wrap first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:text-amber-800 first-letter:mr-3 first-letter:float-left mb-8">
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

                <div className="mt-12 md:mt-16 space-y-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleToggleItinerary(e, selectedStory.id)}
                      className={`flex-1 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all py-5 rounded-2xl ${
                        itinerary.includes(selectedStory.id) ? 'bg-amber-600 text-white shadow-2xl scale-105' : 'bg-white text-stone-400 hover:text-amber-800 shadow-sm border border-stone-100'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={itinerary.includes(selectedStory.id) ? "currentColor" : "none"} />
                      {itinerary.includes(selectedStory.id) ? 'Saved' : 'Save Story'}
                    </button>
                    <button className="p-5 bg-white text-stone-400 hover:text-stone-900 transition shadow-sm border border-stone-100 rounded-2xl"><Share2 size={20} /></button>
                  </div>

                  <button 
                    onClick={(e) => openAddPhoto(e, selectedStory)}
                    className="w-full flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] bg-stone-900 text-white py-5 rounded-2xl hover:bg-stone-800 transition shadow-2xl"
                  >
                    <Plus size={20} /> Post Your Perspective
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowUploadModal(false)} className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-xl p-8 md:p-12 overflow-hidden border border-stone-100 max-h-[95vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-amber-600"></div>
              
              {submitted ? (
                <div className="py-12 md:py-16 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 md:w-24 md:h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tighter">Story Shared!</h3>
                  <p className="text-stone-500 font-medium text-base md:text-lg px-4">Your perspective has been sent for moderation. It will join the Soul of Assam soon.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8 md:mb-10">
                    <h3 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter leading-none">
                      {uploadParentId ? 'Add to ' : 'Share a '} <span className="text-amber-600">{uploadParentId ? 'Story' : 'Tradition'}</span>
                    </h3>
                    <button onClick={() => setShowUploadModal(false)} className="p-2 text-stone-300 hover:text-stone-900 transition"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="relative group border-4 border-dashed border-stone-50 rounded-[2rem] p-8 md:p-10 text-center hover:border-amber-200 transition-all cursor-pointer bg-stone-50/50">
                      <input required={!uploadParentId} type="file" accept="image/*,video/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center">
                        {selectedFile ? (
                          <div className="flex items-center gap-3 text-amber-700 bg-white px-6 py-3 rounded-2xl shadow-sm font-black text-xs uppercase tracking-widest">
                            {selectedFile.type.startsWith('video') ? <FileVideo size={18}/> : <ImageIcon size={18}/>}
                            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Upload className="w-7 h-7 text-amber-600" />
                            </div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Upload Photo or Video</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input type="text" placeholder="Your Name" value={formData.contributor} onChange={(e) => setFormData({...formData, contributor: e.target.value})} className="w-full bg-stone-50 rounded-2xl pl-14 pr-5 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-bold text-stone-900 transition-all border border-stone-100" />
                      </div>

                      {!uploadParentId && (
                        <>
                          <input required type="text" placeholder="Title of the Tradition" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-black text-stone-900 tracking-tight transition-all border border-stone-100" />
                          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none font-black text-stone-900 capitalize border border-stone-100">
                            {categories.filter(c => c.name !== 'all').map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                          <textarea required placeholder="Tell the story and its cultural significance..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-medium text-stone-700 h-40 transition-all border border-stone-100 resize-none"></textarea>
                        </>
                      )}

                      {uploadParentId && (
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Contributing to</p>
                          <p className="text-lg font-black text-stone-900">{formData.title}</p>
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-800 text-white rounded-2xl py-6 font-black hover:bg-amber-900 transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest text-xs">
                      {isSubmitting ? 'Sending to Elders...' : uploadParentId ? 'Post Perspective' : 'Share Tradition'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Suggestion Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowEditModal(false)} className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-12 overflow-hidden border border-stone-100">
              <div className="absolute top-0 left-0 w-full h-3 bg-stone-900"></div>
              
              {submitted ? (
                <div className="py-16 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h3 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter">Edit Suggested!</h3>
                  <p className="text-stone-500 font-medium text-lg">Your suggested improvements are being reviewed.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-4xl font-black text-stone-900 tracking-tighter leading-none">Refine <span className="text-amber-600">Story</span></h3>
                    <button onClick={() => setShowEditModal(false)} className="p-2 text-stone-300 hover:text-stone-900 transition"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleSuggestEdit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Improved Title</label>
                        <input required type="text" placeholder="Title of the tradition" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-black text-stone-900 tracking-tight transition-all border border-stone-100" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Enhanced Description</label>
                        <textarea required placeholder="Add more depth and cultural context..." value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} className="w-full bg-stone-50 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-amber-100 font-medium text-stone-700 h-60 transition-all border border-stone-100 resize-none"></textarea>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white rounded-2xl py-6 font-black hover:bg-stone-800 transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest text-xs">
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

export default CulturePage;
