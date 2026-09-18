import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';

function StatCard({ title, labelPred, predVal, labelTrue, trueVal, unit, isWarning }) {
  const isAvailable = predVal !== null && trueVal !== null;
  const absError = isAvailable ? Math.abs(predVal - trueVal) : 0;
  const relError = isAvailable && trueVal !== 0 ? (absError / Math.abs(trueVal)) * 100 : 0;
  
  let errColor = '#00ff88'; // green
  if (relError > 15 || absError > 0.5) errColor = '#ff003c'; // red
  else if (relError > 5 || absError > 0.2) errColor = '#ffd000'; // yellow

  return (
    <div className="glass rounded-xl p-4 flex flex-col relative overflow-hidden group">
      {/* Background glow on warning */}
      {isWarning && isAvailable && (
        <div className="absolute inset-0 bg-neon-red/5 animate-pulse-glow pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between mb-3 z-10">
        <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
          {title}
        </h3>
        {!isAvailable && (
          <span className="text-[9px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 uppercase">
            Awaiting Data
          </span>
        )}
      </div>

      {isAvailable ? (
        <div className="flex flex-col gap-2 z-10">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{labelPred}</span>
            <div className="flex items-baseline gap-1">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={predVal}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-mono text-2xl font-semibold text-cyber-cyan"
                >
                  {predVal.toFixed(3)}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end border-t border-white/10 pt-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{labelTrue}</span>
            <div className="flex items-baseline gap-1">
               <span className="font-mono text-lg text-slate-300">
                  {trueVal.toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
            </div>
          </div>
          
          <div className="mt-2 flex gap-2">
             <div className="flex-1 bg-black/40 rounded p-1.5 text-center flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Abs Error</span>
                <span className="font-mono text-xs font-semibold text-white/80">{absError.toFixed(3)}</span>
             </div>
             <div className="flex-1 bg-black/40 rounded p-1.5 text-center flex flex-col" style={{ boxShadow: `inset 0 2px 0 0 ${errColor}`}}>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Rel Error</span>
                <span className="font-mono text-xs font-semibold" style={{ color: errColor }}>
                   {relError.toFixed(1)}%
                </span>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60 min-h-[100px] z-10">
            <AlertTriangle className="w-6 h-6 mb-2" strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-widest text-center px-4">Not available in current API step</p>
        </div>
      )}
    </div>
  );
}

export default function ForecastPanel({ sim }) {
  const lastData = sim.simulationData[sim.simulationData.length - 1];
  
  if (!lastData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 opacity-50 pointer-events-none grayscale">
         <StatCard title="Ex Forecast" labelPred="Predicted Ex" labelTrue="Actual Ex" unit="V/km" predVal={null} trueVal={null} />
         <StatCard title="Ey Forecast" labelPred="Predicted Ey" labelTrue="Actual Ey" unit="V/km" predVal={null} trueVal={null} />
         <StatCard title="Emag (GIC)" labelPred="Predicted Emag" labelTrue="Actual Emag" unit="V/km" predVal={null} trueVal={null} />
      </div>
    );
  }

  // Determine if backend sent full 3-channel data or legacy ykcx data
  const hasEx = lastData.predEx !== null;
  const hasEy = lastData.predEy !== null; 
  const hasEmag = lastData.predEmag !== null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard 
        title="Ex Forecast" 
        labelPred="Predicted Ex" 
        labelTrue="Actual Ex" 
        unit="V/km" 
        predVal={hasEx ? lastData.predEx : null} 
        trueVal={hasEx ? lastData.trueEx : null} 
      />
      <StatCard 
        title="Ey Forecast" 
        labelPred="Predicted Ey" 
        labelTrue="Actual Ey" 
        unit="V/km" 
        predVal={hasEy ? lastData.predEy : null} 
        trueVal={hasEy ? lastData.trueEy : null} 
      />
      <StatCard 
        title="Emag (Magnitude)" 
        labelPred="Predicted Emag" 
        labelTrue="Actual Emag" 
        unit="V/km" 
        predVal={hasEmag ? lastData.predEmag : null} 
        trueVal={hasEmag ? lastData.trueEmag : null} 
        isWarning={(hasEmag ? lastData.predEmag : 0) > 1.0}
      />
    </div>
  );
}
