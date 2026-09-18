import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Wifi, WifiOff, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../data/constants';

export default function Navbar({ apiStatus, currentTimestamp }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const connected = apiStatus === 'connected';

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Hexagon className="w-7 h-7 text-cyber-cyan" strokeWidth={1.5} />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white leading-none">
                GICTransformer
              </h1>
              <p className="text-[9px] tracking-[0.2em] text-cyber-cyan/60 uppercase mt-0.5 hidden sm:block">
                AI-Powered Geomagnetic Storm Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-3 py-1.5 text-[11px] tracking-wider uppercase text-slate-400 hover:text-cyber-cyan transition-colors rounded hover:bg-white/5"
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            {currentTimestamp && (
              <span className="hidden md:inline text-xs font-mono text-slate-500">
                {currentTimestamp}
              </span>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-medium ${
              connected
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                : 'bg-neon-red/10 text-neon-red border border-neon-red/20'
            }`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{connected ? 'API Connected' : 'API Offline'}</span>
              <span
                className="status-dot shrink-0"
                style={{ backgroundColor: connected ? '#00ff88' : '#ff003c', color: connected ? '#00ff88' : '#ff003c' }}
              />
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="lg:hidden glass-strong border-t border-white/5"
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left px-3 py-2 text-xs tracking-wider uppercase text-slate-400 hover:text-cyber-cyan transition-colors rounded hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
