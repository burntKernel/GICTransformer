import React, { useMemo } from 'react';
import { Target, TrendingDown, Clock3, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

export default function ModelPerformance({ sim }) {
  const { simulationData, latency } = sim;
  const count = simulationData.length;

  const metrics = useMemo(() => {
    if (count === 0) return { mae: 0, rmse: 0, corr: 0 };
    
    // Only calculate using the Ex channel for overall metric summary
    // Since Ex is the primary geoelectric field component
    const data = simulationData.filter(d => d.trueEx !== null && d.predEx !== null);
    if (data.length === 0) return { mae: 0, rmse: 0, corr: 0 };

    let sumAbs = 0;
    let sumSq = 0;
    
    // For Pearson correlation
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = data.length;

    data.forEach(d => {
      const act = d.trueEx;
      const pred = d.predEx;
      const err = pred - act;
      
      sumAbs += Math.abs(err);
      sumSq += err * err;
      
      sumX += act;
      sumY += pred;
      sumXY += act * pred;
      sumX2 += act * act;
      sumY2 += pred * pred;
    });

    const mae = sumAbs / n;
    const rmse = Math.sqrt(sumSq / n);
    
    // Pearson
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const corr = denominator === 0 ? 0 : numerator / denominator;

    return { mae, rmse, corr };
  }, [simulationData, count]);

  const errorData = useMemo(() => {
     return simulationData
      .filter(d => d.trueEx !== null && d.predEx !== null)
      .map(d => ({
        time: d.timestamp,
        error: Math.abs(d.predEx - d.trueEx)
      }));
  }, [simulationData]);

  return (
    <div className="glass rounded-xl p-5 h-[400px] flex flex-col bg-black/20">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-neon-green" strokeWidth={1.5} />
        <h3 className="text-[11px] tracking-[0.2em] text-slate-400 uppercase font-semibold">
          Error Analytics (Client-Side)
        </h3>
      </div>
      
       <div className="flexitems-start gap-2 bg-white/5 rounded p-2 mb-4">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-400/80 leading-relaxed uppercase tracking-wider">
             Metrics dynamically computed from observed simulation Ex data.
          </p>
       </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
         <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">RMSE (Ex)</span>
            <span className="text-xl font-mono text-neon-green font-semibold">
               {count > 0 ? metrics.rmse.toFixed(4) : '—'}
            </span>
         </div>
         <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">MAE (Ex)</span>
            <span className="text-xl font-mono text-white font-semibold">
               {count > 0 ? metrics.mae.toFixed(4) : '—'}
            </span>
         </div>
         <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Pearson r</span>
            <span className="text-lg font-mono text-white font-semibold">
               {count > 1 ? metrics.corr.toFixed(3) : '—'}
            </span>
         </div>
         <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><Clock3 className="w-3 h-3"/> API Latency</span>
            <span className="text-lg font-mono text-cyber-cyan font-semibold">
               {count > 0 ? `${latency}ms` : '—'}
            </span>
         </div>
      </div>

      <h4 className="text-[8px] uppercase tracking-[0.2em] text-slate-500 mb-2 font-bold px-1 flex items-center gap-1">
         <TrendingDown className="w-3 h-3" /> Absolute Error Over Time
      </h4>
      <div className="flex-1 w-full min-h-0 bg-black/20 rounded-lg p-1 border border-white/5">
         {errorData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={errorData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 'auto']} />
                  <RTooltip content={<ErrorTooltip />} cursor={{ stroke: '#ffffff20' }} />
                  <Line 
                     type="monotone" 
                     dataKey="error" 
                     stroke="#ff003c" 
                     strokeWidth={1.5} 
                     dot={false}
                     activeDot={{ r: 3, fill: '#ff003c' }}
                     isAnimationActive={false}
                  />
               </LineChart>
            </ResponsiveContainer>
         ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
               <span className="text-[9px] uppercase tracking-widest">No Data</span>
            </div>
         )}
      </div>
    </div>
  );
}

function ErrorTooltip({ active, payload, label }) {
   if (active && payload && payload.length) {
      return (
         <div className="bg-black/90 border border-white/10 rounded p-1.5 shadow-xl text-center">
            <p className="text-[9px] text-slate-400 font-mono mb-1">{label}</p>
            <p className="font-mono text-neon-red text-xs">ERR: {payload[0].value.toFixed(4)}</p>
         </div>
      );
   }
   return null;
}
