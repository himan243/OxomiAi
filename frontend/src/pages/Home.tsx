import React from 'react';
import MapComponent from '../components/MapComponent';
import { motion } from 'framer-motion';
import { Compass, BookOpen, Users, ArrowDown } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20 md:pt-0">
        {/* Background Image Layer for Hero */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 scale-105 transition-transform duration-[10s] ease-linear animate-slow-zoom"
          style={{ backgroundImage: "url('/bgr/bihu.jpg')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#fdfcf7]/50 to-[#fdfcf7]"></div>

        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/80 backdrop-blur-md text-amber-800 font-bold text-[10px] md:text-sm mb-6 border border-amber-100/50 uppercase tracking-widest shadow-sm">
            <Compass size={16} className="hidden md:block" />
            <span>Discover the heart of Northeast India</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-amber-900 mb-6 tracking-tighter drop-shadow-sm">
            Oxomi<span className="text-orange-600">Ai</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-2xl text-stone-600 font-medium leading-relaxed mx-auto px-4 drop-shadow-sm">
            An interactive odyssey through the 35 districts of Assam. 
            Uncover the stories and hidden gems of the land of the Red River.
          </p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="w-px h-12 md:h-16 bg-gradient-to-b from-amber-600 to-transparent"></div>
            <span className="text-amber-800 font-black tracking-[0.3em] text-[10px] uppercase">Begin Exploration</span>
            <ArrowDown className="text-amber-600 animate-bounce" size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 relative" id="map-section">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 px-2 relative z-10">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black text-stone-900 mb-4 tracking-tighter leading-none">The Cultural Map</h2>
              <p className="text-base md:text-lg text-stone-500 font-medium">
                Every district is a chapter. Hover to discover, click to enter. 
                Experience immersive transitions into the soul of each region.
              </p>
            </div>
            <div className="flex gap-10 bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/50">
              <div className="text-left md:text-center">
                <p className="text-3xl md:text-4xl font-black text-amber-800">35</p>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Districts</p>
              </div>
              <div className="text-left md:text-center">
                <p className="text-3xl md:text-4xl font-black text-amber-800">1000+</p>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Stories</p>
              </div>
            </div>
          </div>
          
          <div className="h-[500px] md:h-[750px] w-full relative group rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/80 backdrop-blur-sm bg-white/10">
            <MapComponent />
          </div>
        </div>
      </section>

      {/* Storytelling Elements */}
      <section className="py-20 md:py-32 px-6 relative">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            { icon: BookOpen, title: "Authentic Lore", desc: "Documented by locals who live and breathe the traditions of their soil." },
            { icon: Users, title: "Community First", desc: "A platform where every Assamese can share their heritage with the world." },
            { icon: Compass, title: "Hidden Gems", desc: "Discover spots beyond the tourist maps, from secret waterfalls to ancient looms." }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-md shadow-sm border border-white/80 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-amber-50/80 rounded-2xl flex items-center justify-center text-amber-700 mb-8 shadow-inner">
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-stone-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Home;
