import React from 'react';
import { motion } from 'framer-motion';
import { STORM_PHASES } from '../../data/constants';

export default function StormTimeline({ currentStep, totalSteps }) {
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  return (
    <div className="glass rounded-xl p-4 sm:p-6 w-full mt-4 flex flex-col items-center">
      <h3 className="w-full text-left text-[11px] tracking-[0.2em] text-slate-400 uppercase font-semibold mb-4 pl-2 border-l-2 border-cyber-cyan/50">
        Storm Timeline Progression
      </h3>

      <div className="relative w-full h-12 flex items-center">
        {/* Base Track */}
        <div className="absolute left-0 right-0 h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden flex">
          {/* Phase Segments */}
          {STORM_PHASES.map((phase) => {
            const width = (phase.pctEnd - phase.pctStart) * 100;
            return (
              <div
                key={phase.id}
                className="h-full relative opacity-80"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${phase.color}40, ${phase.color}80)`,
                  borderRight: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            );
          })}
        </div>

        {/* Phase Labels (above & below) */}
        <div className="absolute inset-0 pointer-events-none">
          {STORM_PHASES.map((phase, i) => {
            const left = (phase.pctStart + (phase.pctEnd - phase.pctStart) / 2) * 100;
            const isTop = i % 2 === 0;
            return (
              <div
                key={phase.id}
                className={`absolute transform -translate-x-1/2 flex flex-col items-center ${
                  isTop ? '-top-6' : 'top-6'
                }`}
                style={{ left: `${left}%` }}
              >
                <div
                  className={`w-0.5 h-2 bg-white/20 mb-1 ${isTop ? 'order-last mt-1 mb-0' : ''}`}
                />
                <span
                  className="text-[9px] tracking-[0.1em] font-semibold whitespace-nowrap"
                  style={{ color: phase.color }}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Position Indicator */}
        {totalSteps > 0 && (
          <motion.div
            className="absolute top-1/2 -mt-2.5 w-5 h-5 rounded-full border-2 border-white shadow-glow-cyan bg-cyber-blue z-10 flex items-center justify-center backdrop-blur-md"
            animate={{ left: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ x: '-50%' }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
