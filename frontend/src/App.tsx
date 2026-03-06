import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Map as MapIcon, Library as LibraryIcon, Heart } from 'lucide-react';
import Home from './pages/Home';
import DistrictPage from './pages/DistrictPage';
import Itinerary from './pages/Itinerary';
import AdminDashboard from './pages/AdminDashboard';
import Library from './pages/Library';
import './App.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/district/:id" element={<DistrictPage />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </AnimatePresence>
  );
};

const NavBar = () => {
  const { scrollY } = useScroll();
  const location = useLocation();
  
  // Desktop Nav dissolves
  const desktopOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const desktopPointerEvents = useTransform(scrollY, (y) => y > 200 ? 'none' : 'auto');

  const navLinks = [
    { to: "/", label: "Map", icon: MapIcon },
    { to: "/library", label: "Library", icon: LibraryIcon },
    { to: "/itinerary", label: "Journey", icon: Heart },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav 
        style={{ opacity: desktopOpacity, pointerEvents: desktopPointerEvents as any }}
        className="fixed top-0 left-0 w-full z-[1000] px-6 py-8 hidden md:flex justify-between items-center mix-blend-difference"
      >
        <Link to="/" className="text-3xl font-black text-white pointer-events-auto tracking-tighter">OxomiAi</Link>
        <div className="flex gap-12 pointer-events-auto">
          {navLinks.map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`text-white/70 hover:text-white font-black transition-all text-xs uppercase tracking-[0.3em] ${location.pathname === link.to ? 'text-white' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </motion.nav>

      {/* Mobile Navigation (Bottom Dock) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] md:hidden w-[90%] max-w-sm">
        <div className="bg-stone-900/90 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl border border-white/10 flex justify-between items-center px-4">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Logo Only */}
      <div className="fixed top-6 left-6 z-[1000] md:hidden mix-blend-difference">
        <Link to="/" className="text-2xl font-black text-white tracking-tighter">OxomiAi</Link>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen font-sans text-stone-900 relative">
        {/* Global Background Image Layer */}
        <div 
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed opacity-10"
          style={{ backgroundImage: "url('/bgr/tea_garden.jpg')" }}
        ></div>
        {/* Subtle Overlay Gradient */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#fdfcf7] via-transparent to-amber-50/30"></div>

        <NavBar />

        <main className="relative z-10">
          <AnimatedRoutes />
        </main>

        <footer className="bg-stone-950 text-stone-500 py-20 px-6 text-center relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <h2 className="text-white text-4xl font-black mb-6 tracking-tighter">OxomiAi</h2>
            <p className="max-w-md mx-auto mb-10 font-medium leading-relaxed">Preserving the cultural heartbeat of Assam through digital storytelling and community lore.</p>
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Instagram</a>
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Twitter</a>
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Archive</a>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">© 2026 Exploring Cultural Assam</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
