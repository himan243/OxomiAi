import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Map as MapIcon, Library as LibraryIcon, Heart, Search, Shield, Sparkles } from 'lucide-react';
import Home from './pages/Home';
import DistrictPage from './pages/DistrictPage';
import Itinerary from './pages/Itinerary';
import AdminDashboard from './pages/AdminDashboard';
import Library from './pages/Library';
import Culture from './pages/Culture';
import SilaChatbot from './components/SilaChatbot';
import './App.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-stone-900 pt-20">
    <Search size={64} className="text-amber-600 mb-6" />
    <h1 className="text-4xl font-black mb-2">Lost in the Map?</h1>
    <p className="text-stone-500 mb-8 font-medium">We couldn't find the page you're looking for.</p>
    <Link to="/" className="bg-amber-800 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-xl">Back to Exploration</Link>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/district/:id" element={<DistrictPage />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/libraries" element={<Navigate to="/library" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const NavBar = () => {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [hidden, setHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY.current && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });
  
  const desktopOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const desktopPointerEvents = useTransform(scrollY, (y) => y > 200 ? 'none' : 'auto');

  const navLinks = [
    { to: "/", label: "Map", icon: MapIcon },
    { to: "/culture", label: "Culture", icon: Sparkles },
    { to: "/library", label: "Library", icon: LibraryIcon },
    { to: "/itinerary", label: "Journey", icon: Heart },
  ];

  return (
    <>
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

      <motion.nav 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: 100, opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] md:hidden w-[95%] max-w-md"
      >
        <div className="bg-stone-900/90 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl border border-white/10 grid grid-cols-4 items-center">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-amber-500 scale-110' : 'text-stone-400'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

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
        <div 
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed opacity-10"
          style={{ backgroundImage: "url('/bgr/tea_garden.jpg')" }}
        ></div>
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#fdfcf7] via-transparent to-amber-50/30"></div>

        <NavBar />

        <main className="relative z-10">
          <AnimatedRoutes />
        </main>

        {/* <SilaChatbot /> */}

        <footer className="bg-stone-950 text-stone-500 py-20 px-6 text-center relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <h2 className="text-white text-4xl font-black mb-6 tracking-tighter">OxomiAi</h2>
            <p className="max-w-md mx-auto mb-10 font-medium leading-relaxed">Preserving the cultural heartbeat of Assam through digital storytelling and community lore.</p>
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Instagram</a>
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Twitter</a>
              <a href="#" className="hover:text-white transition font-black text-[10px] uppercase tracking-[0.3em]">Archive</a>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">© 2026 Exploring Cultural Assam</p>
              <Link to="/admin" className="opacity-5 hover:opacity-100 transition-opacity text-white">
                <Shield size={12} />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
