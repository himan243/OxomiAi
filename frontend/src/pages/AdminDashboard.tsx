import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CheckCircle2, Trash2, Filter, Search, RefreshCcw, Eye, MapPin, X, ArrowRight } from 'lucide-react';
import { adminFetchAllContent, rejectContent, supabase } from '../services/api';
import { ASSAM_DISTRICTS } from '../utils/districts';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [stories, setStories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'suggestions'>('content');
  
  // Filter States
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("AdminDashboard: Fetching stories...");
      const storyData = await adminFetchAllContent();
      console.log("AdminDashboard: Stories fetched:", storyData?.length);
      const currentStories = storyData || [];
      setStories(currentStories);

      console.log("AdminDashboard: Fetching suggestions...");
      try {
        const { data: suggestionData, error: suggestionError } = await supabase
          .from('content_suggestions')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("AdminDashboard: Raw suggestionData from Supabase:", suggestionData);
        
        if (suggestionError) {
          console.warn("Suggestions fetch error:", suggestionError);
        } else {
          // Manually join with stories in frontend for reliability
          const joinedSuggestions = (suggestionData || []).map((sugg: any) => {
            const story = currentStories.find(s => s.id.toString() === sugg.content_id?.toString());
            if (!story) console.warn("AdminDashboard: Could not find story for suggestion:", sugg.content_id);
            return {
              ...sugg,
              cultural_content: story
            };
          });
          console.log("AdminDashboard: Suggestions joined count:", joinedSuggestions.length);
          setSuggestions(joinedSuggestions);
        }
      } catch (innerErr) {
        console.warn("Suggestions fetch failed silently:", innerErr);
      }
    } catch (err) {
      console.error("AdminDashboard: Critical fetch error:", err);
      alert('Failed to load dashboard data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSuggestion = async (suggestion: any) => {
    if (!window.confirm('Apply these changes to the original story?')) return;
    try {
      // 1. Update the original story
      const { error: updateError } = await supabase
        .from('cultural_content')
        .update({
          title: suggestion.suggested_title,
          description: suggestion.suggested_description
        })
        .eq('id', suggestion.content_id);
      
      if (updateError) throw updateError;

      // 2. Mark suggestion as approved (or just delete it)
      const { error: deleteError } = await supabase
        .from('content_suggestions')
        .delete()
        .eq('id', suggestion.id);
      
      if (deleteError) throw deleteError;

      // 3. Update local state
      setStories(stories.map(s => s.id === suggestion.content_id ? { 
        ...s, 
        title: suggestion.suggested_title, 
        description: suggestion.suggested_description 
      } : s));
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
      setSelectedSuggestion(null);
      alert('Changes applied successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to apply suggestion');
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    if (!window.confirm('Reject and delete this suggestion?')) return;
    try {
      const { error } = await supabase
        .from('content_suggestions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSuggestions(suggestions.filter(s => s.id !== id));
      setSelectedSuggestion(null);
    } catch (err) {
      alert('Failed to reject suggestion');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    if (password === adminKey) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid authorization key');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      const { error } = await supabase
        .from('cultural_content')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setStories(stories.map(s => s.id === id ? { ...s, status: newStatus } : s));
      if (selectedStory && selectedStory.id === id) {
        setSelectedStory({ ...selectedStory, status: newStatus });
      }
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('PERMANENT DELETE: Are you sure? This cannot be undone.')) return;
    try {
      await rejectContent(id);
      setStories(stories.filter(s => s.id !== id));
      if (selectedStory && selectedStory.id === id) {
        setSelectedStory(null);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredStories = stories.filter(story => {
    const storyDistrict = story.district || '';
    const storyCategory = story.category || '';
    const storyTitle = story.title || '';
    const storyDesc = story.description || '';

    const matchDistrict = filterDistrict === 'all' || storyDistrict.toLowerCase() === filterDistrict.toLowerCase();
    const matchCategory = filterCategory === 'all' || storyCategory.toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = filterStatus === 'all' || story.status === filterStatus;
    const matchSearch = storyTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        storyDesc.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchDistrict && matchCategory && matchStatus && matchSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-amber-600"></div>
          <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-8 rotate-3">
            <Lock size={40} />
          </div>
          <h2 className="text-4xl font-black text-stone-900 text-center mb-2 tracking-tighter">Admin Vault</h2>
          <p className="text-stone-400 text-center mb-10 font-bold uppercase tracking-widest text-xs">OxomiAi Management</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key" 
              className="w-full bg-stone-50 rounded-2xl px-6 py-5 border-2 border-transparent focus:border-amber-500 outline-none font-bold text-lg text-center transition-all shadow-inner"
            />
            {error && <p className="text-red-500 font-black text-xs text-center uppercase tracking-widest">{error}</p>}
            <button className="w-full bg-stone-900 text-white rounded-2xl py-5 font-black hover:bg-stone-800 transition shadow-xl uppercase tracking-widest text-sm">Unlock Interface</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading && stories.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfcf7] flex flex-col items-center justify-center">
        <RefreshCcw size={48} className="text-amber-600 animate-spin mb-4" />
        <p className="font-black text-stone-400 uppercase tracking-widest text-xs">Accessing Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf7] pt-24 md:pt-32 pb-20 px-4 md:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-3 text-amber-600 font-black tracking-widest uppercase text-[10px] md:text-xs mb-4">
              <ShieldCheck size={18} />
              <span>System Administrator</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter leading-none">The Moderation <span className="text-amber-600">Vault</span></h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={loadData} className="flex-1 md:flex-none p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-amber-600 transition flex items-center justify-center">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="flex-[3] md:flex-none px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-stone-800 transition">Lock Vault</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Total Stories', value: stories.length, color: 'text-stone-900' },
            { label: 'Pending Review', value: stories.filter(s => s.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Live on Site', value: stories.filter(s => s.status === 'approved').length, color: 'text-green-600' },
            { label: 'Districts', value: `${new Set(stories.map(s => s.district)).size}/35`, color: 'text-stone-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100">
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 mb-2">{stat.label}</p>
              <p className={`text-2xl md:text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="text" 
                placeholder="Search titles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            
            <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100 capitalize appearance-none">
              <option value="all">All Districts</option>
              {ASSAM_DISTRICTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>

            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100 capitalize appearance-none">
              <option value="all">All Categories</option>
              {['Festivals', 'Events', 'Tourist Places', 'Food', 'Craft', 'Heritage', 'Hidden Gems'].map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100 appearance-none">
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'content' ? 'bg-amber-800 text-white shadow-lg scale-105' : 'bg-white text-stone-400 hover:text-amber-800'
            }`}
          >
            Stories & Media
          </button>
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all relative ${
              activeTab === 'suggestions' ? 'bg-amber-800 text-white shadow-lg scale-105' : 'bg-white text-stone-400 hover:text-amber-800'
            }`}
          >
            Edit Suggestions
            {suggestions.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-[#fdfcf7]">
                {suggestions.length}
              </span>
            )}
          </button>
        </div>

        {/* Data Table / List */}
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-stone-100 overflow-hidden mb-20">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-50">
              <thead className="bg-stone-50/50">
                <tr>
                  <th className="px-6 md:px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {activeTab === 'content' ? 'Story' : 'Suggested Improvement'}
                  </th>
                  <th className="hidden md:table-cell px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {activeTab === 'content' ? 'Location' : 'Original Story'}
                  </th>
                  <th className="px-6 md:px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 md:px-10 py-6 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                <AnimatePresence mode="wait">
                  {activeTab === 'content' ? (
                    filteredStories.length > 0 ? filteredStories.map((story) => (
                      <motion.tr 
                        key={story.id}
                        layoutId={`admin-row-${story.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedStory(story)}
                        className="hover:bg-stone-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 md:px-10 py-6 md:py-8">
                          <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-stone-100 shadow-sm flex-shrink-0">
                              {story.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-stone-200">
                                  <Eye size={20} className="text-stone-400" />
                                </div>
                              ) : (
                                <img src={story.media_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-stone-900 md:text-lg tracking-tight mb-1">{story.title}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-stone-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{story.category}</p>
                                <span className="md:hidden text-stone-200">|</span>
                                <span className="md:hidden text-stone-400 text-[8px] font-black uppercase tracking-widest capitalize">{story.district}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-10 py-8">
                          <div className="flex items-center gap-2 text-stone-600 font-bold capitalize text-sm">
                            <MapPin size={14} className="text-amber-600" />
                            {story.district}
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-8">
                          <div className={`inline-flex px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                            story.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {story.status}
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-8 text-right">
                          <ArrowRight size={20} className="inline text-stone-200 group-hover:text-amber-600 group-hover:translate-x-2 transition-all" />
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                            <Filter size={32} />
                          </div>
                          <p className="text-stone-400 font-black uppercase tracking-widest text-xs">No stories found</p>
                        </td>
                      </tr>
                    )
                  ) : (
                    suggestions.length > 0 ? suggestions.map((sugg) => (
                      <motion.tr 
                        key={sugg.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSuggestion(sugg)}
                        className="hover:bg-stone-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 md:px-10 py-6 md:py-8">
                          <div>
                            <p className="font-black text-stone-900 md:text-lg tracking-tight mb-1">{sugg.suggested_title}</p>
                            <p className="text-stone-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">New Proposal</p>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-10 py-8">
                          <div className="text-stone-600 font-bold text-sm">
                            {sugg.cultural_content?.title || 'Unknown Story'}
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-8">
                          <div className="inline-flex px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                            {sugg.status}
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-8 text-right">
                          <ArrowRight size={20} className="inline text-stone-200 group-hover:text-amber-600 group-hover:translate-x-2 transition-all" />
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                            <RefreshCcw size={32} />
                          </div>
                          <p className="text-stone-400 font-black uppercase tracking-widest text-xs">No pending suggestions</p>
                        </td>
                      </tr>
                    )
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expanded Review Modal (Story) */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-2 md:p-10 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStory(null)} className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"></motion.div>
            <motion.div 
              layoutId={`admin-row-${selectedStory.id}`}
              className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              <div className="w-full md:w-3/5 h-[45vh] md:h-auto bg-stone-900 relative">
                {selectedStory.type === 'video' ? (
                  <video src={selectedStory.media_url} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <img src={selectedStory.media_url} alt={selectedStory.title} className="w-full h-full object-cover" />
                )}
                <button onClick={() => setSelectedStory(null)} className="absolute top-6 left-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all md:hidden"><X size={24} /></button>
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-16 overflow-y-auto bg-[#fdfcf7] flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div className="inline-flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                      {selectedStory.category}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit ${
                      selectedStory.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      Current: {selectedStory.status}
                    </div>
                  </div>
                  <button onClick={() => setSelectedStory(null)} className="hidden md:flex p-2 text-stone-300 hover:text-stone-900 transition hover:bg-stone-100 rounded-full"><X size={28} /></button>
                </div>

                <h3 className="text-4xl md:text-5xl font-black text-stone-900 mb-8 tracking-tighter leading-[0.9]">
                  {selectedStory.title}
                </h3>

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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-0.5">District</p>
                      <p className="text-sm font-bold text-stone-900 uppercase tracking-tight capitalize">{selectedStory.district}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-stone-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedStory.description}
                  </p>
                </div>

                <div className="mt-12 pt-10 border-t border-stone-100 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleStatus(selectedStory.id, selectedStory.status)}
                      className={`flex-1 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-lg ${
                        selectedStory.status === 'approved' 
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {selectedStory.status === 'approved' ? <RefreshCcw size={18} /> : <CheckCircle2 size={18} />}
                      {selectedStory.status === 'approved' ? 'Move to Pending' : 'Approve Story'}
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedStory.id)}
                      className="p-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition shadow-sm border border-red-100"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Review Modal (Suggestion) */}
      <AnimatePresence>
        {selectedSuggestion && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-2 md:p-10 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSuggestion(null)} className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"></motion.div>
            
            <motion.div className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-stone-50 border-r border-stone-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">Current Content</p>
                <h4 className="text-2xl font-black text-stone-400 mb-4">{selectedSuggestion.cultural_content?.title}</h4>
                <p className="text-stone-400 font-medium leading-relaxed whitespace-pre-wrap">{selectedSuggestion.cultural_content?.description}</p>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Proposed Changes</p>
                  <button onClick={() => setSelectedSuggestion(null)} className="text-stone-300 hover:text-stone-900 transition"><X size={28} /></button>
                </div>

                <h4 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 tracking-tighter leading-tight">{selectedSuggestion.suggested_title}</h4>
                <div className="flex-1">
                  <p className="text-stone-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">{selectedSuggestion.suggested_description}</p>
                </div>

                <div className="mt-12 pt-10 border-t border-stone-100 flex gap-4">
                  <button 
                    onClick={() => handleApproveSuggestion(selectedSuggestion)}
                    className="flex-1 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg"
                  >
                    <CheckCircle2 size={18} /> Apply Changes
                  </button>
                  <button 
                    onClick={() => handleRejectSuggestion(selectedSuggestion.id)}
                    className="flex-1 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={18} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
