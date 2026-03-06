import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CheckCircle2, Trash2, Filter, Search, RefreshCcw, Eye, MapPin } from 'lucide-react';
import { adminFetchAllContent, rejectContent, supabase } from '../services/api';
import { ASSAM_DISTRICTS } from '../utils/districts';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await adminFetchAllContent();
      setStories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    console.log("Checking key...", { provided: password, expectedLength: adminKey?.length }); // Debug log
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
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('PERMANENT DELETE: Are you sure? This cannot be undone.')) return;
    try {
      await rejectContent(id);
      setStories(stories.filter(s => s.id !== id));
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

  return (
    <div className="min-h-screen bg-[#fdfcf7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-3 text-amber-600 font-black tracking-widest uppercase text-xs mb-4">
              <ShieldCheck size={18} />
              <span>System Administrator</span>
            </div>
            <h1 className="text-6xl font-black text-stone-900 tracking-tighter leading-none">The Moderation <span className="text-amber-600">Vault</span></h1>
          </div>
          <div className="flex gap-4">
            <button onClick={loadStories} className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-amber-600 transition">
              <RefreshCcw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-stone-800 transition">Lock Vault</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Stories', value: stories.length, color: 'text-stone-900' },
            { label: 'Pending Review', value: stories.filter(s => s.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Live on Site', value: stories.filter(s => s.status === 'approved').length, color: 'text-green-600' },
            { label: 'Districts Covered', value: `${new Set(stories.map(s => s.district)).size}/35`, color: 'text-stone-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            
            <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100 capitalize">
              <option value="all">All Districts</option>
              {ASSAM_DISTRICTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>

            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100 capitalize">
              <option value="all">All Categories</option>
              {['Festivals', 'Events', 'Tourist Places', 'Food', 'Craft', 'Heritage', 'Hidden Gems'].map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-6 py-4 bg-stone-50 rounded-2xl border-none font-bold text-stone-900 focus:ring-4 focus:ring-amber-100">
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-50">
              <thead className="bg-stone-50/50">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Visual</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Story Info</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Location</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                <AnimatePresence>
                  {filteredStories.length > 0 ? filteredStories.map((story) => (
                    <motion.tr 
                      key={story.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-stone-50/30 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shadow-sm relative">
                          {story.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-stone-200">
                              <Eye size={20} className="text-stone-400" />
                            </div>
                          ) : (
                            <img src={story.media_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="max-w-md">
                          <p className="font-black text-stone-900 text-lg tracking-tight mb-1">{story.title}</p>
                          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">{story.category}</p>
                          <p className="text-stone-500 text-sm line-clamp-1 font-medium">{story.description}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-stone-600 font-bold capitalize">
                          <MapPin size={14} className="text-amber-600" />
                          {story.district}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          story.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {story.status}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleStatus(story.id, story.status)}
                            className={`p-3 rounded-2xl transition shadow-sm ${
                              story.status === 'approved' 
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                            title={story.status === 'approved' ? "Move to Pending" : "Approve Content"}
                          >
                            {story.status === 'approved' ? <RefreshCcw size={20} /> : <CheckCircle2 size={20} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(story.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition shadow-sm"
                            title="Delete Permanently"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                          <Filter size={32} />
                        </div>
                        <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No stories found matching filters</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
