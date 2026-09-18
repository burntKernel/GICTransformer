import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon } from 'lucide-react';

const MESSAGES = [
  'INITIALIZING GICTRANSFORMER...',
  'LOADING NEURAL NETWORK WEIGHTS...',
  'CONNECTING SATELLITE TELEMETRY...',
  'CALIBRATING SENSOR ARRAY...',
  'INITIALIZING 3D VISUALIZATION...',
  'SYSTEM READY',
];

export default function LoadingScreen({ onComplete }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => {
        const next = prev + 1;
        setProgress((next / (MESSAGES.length - 1)) * 100);
        if (next >= MESSAGES.length - 1) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 600);
        }
        return Math.min(next, MESSAGES.length - 1);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-space-950"
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Rotating hexagon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="relative mb-8"
        >
          <Hexagon className="w-20 h-20 text-cyber-cyan/30" strokeWidth={0.8} />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Hexagon className="w-12 h-12 text-cyber-cyan" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-[0.3em] text-white mb-2">
          GICTRANSFORMER
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-cyber-cyan/50 uppercase mb-10">
          Space Weather Intelligence System
        </p>

        {/* Status message */}
        <div className="h-5 mb-4">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.15em] text-slate-400 font-mono"
          >
            {MESSAGES[msgIdx]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
