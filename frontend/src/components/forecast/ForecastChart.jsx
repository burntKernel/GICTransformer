import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function ForecastChart({ sim }) {
  const [activeChannel, setActiveChannel] = useState('Ex'); // 'Ex', 'Ey', 'Emag'
  
  // Format data for Recharts, taking only every Nth point if too many, to keep performance up.
  // Actually, since there are 600 points max, rendering 600 points is fine for Recharts in a ResponsiveContainer.
  const chartData = useMemo(() => {
    return sim.simulationData.map(d => ({
      time: d.timestamp,
      Actual: d[`true${activeChannel}`],
      Predicted: d[`pred${activeChannel}`]
    })).filter(d => d.Actual !== null && d.Predicted !== null);
  }, [sim.simulationData, activeChannel]);
  
  const hasData = chartData.length > 0;

  return (
    <div className="glass rounded-xl p-4 sm:p-5 h-[400px] flex flex-col relative w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-[11px] tracking-[0.2em] text-slate-400 uppercase font-semibold">
          Real-Time Time-Series Forecast
        </h3>
        
        {/* Channel selector */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 w-fit">
          {['Ex', 'Ey', 'Emag'].map(ch => (
             <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${
                  activeChannel === ch 
                     ? 'bg-cyber-blue/20 text-cyber-cyan shadow-glow-cyan' 
                     : 'text-slate-500 hover:text-slate-300'
                }`}
             >
                {ch}
             </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
         {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 border border-dashed border-white/10 rounded-lg bg-black/20">
               <span className="text-xs uppercase tracking-widest font-semibold mb-2">Awaiting Simulation Data</span>
               <span className="text-[10px] max-w-xs text-center leading-relaxed">Start the simulation to stream {activeChannel} predictions from the Transformer backend.</span>
            </div>
         )}
         
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
               <XAxis 
                  dataKey="time" 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 10, fontFamily: 'monospace' }} 
                  tickMargin={10}
                  minTickGap={30}
               />
               <YAxis 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => val.toFixed(1)}
                  width={60}
                  domain={['auto', 'auto']}
               />
               <Tooltip content={<CustomTooltip />} />
               <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }}
               />
               
               <Line 
                  type="monotone" 
                  dataKey="Actual" 
                  stroke="#0080ff" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#0080ff' }}
                  isAnimationActive={false}
               />
               <Line 
                  type="monotone" 
                  dataKey="Predicted" 
                  stroke="#d946ef" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#d946ef' }}
                  isAnimationActive={false}
               />
            </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
   if (active && payload && payload.length) {
      const act = payload.find(p => p.dataKey === 'Actual');
      const pred = payload.find(p => p.dataKey === 'Predicted');
      
      return (
         <div className="glass-strong border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-xl">
            <p className="text-[10px] text-slate-400 mb-2 font-mono pb-2 border-b border-white/10">{label} UTC</p>
            <div className="flex flex-col gap-1.5">
               {act && (
                  <div className="flex items-center gap-4 justify-between">
                     <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0080ff]"></span> Actual
                     </span>
                     <span className="font-mono text-xs text-white">{act.value.toFixed(3)} V/km</span>
                  </div>
               )}
               {pred && (
                  <div className="flex items-center gap-4 justify-between">
                     <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef]"></span> Predicted
                     </span>
                     <span className="font-mono text-xs text-white">{pred.value.toFixed(3)} V/km</span>
                  </div>
               )}
               {act && pred && (
                  <div className="flex items-center gap-4 justify-between pt-1 border-t border-white/10 mt-0.5">
                     <span className="text-[9px] uppercase tracking-widest text-slate-500">Error</span>
                     <span className="font-mono text-[10px] text-neon-red/80">
                        {Math.abs(act.value - pred.value).toFixed(3)}
                     </span>
                  </div>
               )}
            </div>
         </div>
      );
   }
   return null;
}
