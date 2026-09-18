import React from 'react';
import { STATIONS, getRiskLevel } from '../../data/constants';

export default function StationsGrid({ sim }) {
  const { selectedStation, selectStation, simulationData } = sim;
  const lastData = simulationData[simulationData.length - 1];

  // Map station ID to current data if selected, else null (since we only simulate one station at a time)
  // Note: Since the backend API currently simulates for the selected configuration station only,
  // we realistically only have live data for the active tracking station.
  // We'll show a placeholder for the others.

  return (
    <div className="glass rounded-xl p-5 md:p-6 w-full">
      <h3 className="text-[11px] tracking-[0.2em] text-slate-400 uppercase font-semibold mb-5 pl-2 border-l-2 border-cyber-cyan/50">
        Global Ground Station Network
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {STATIONS.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            // Only show live data for the currently selected/simulated station
            const liveData = isSelected && lastData ? lastData : null;
            const val = liveData?.predEmag ?? liveData?.predEx ?? null;
            const risk = val !== null ? getRiskLevel(val) : { label: 'STANDBY', color: '#4a5568' };
            const isActive = isSelected;

            return (
               <button
                  key={station.id}
                  onClick={() => selectStation(station)}
                  className={`text-left rounded-xl p-4 transition-all duration-300 relative overflow-hidden group ${
                     isActive 
                        ? 'bg-cyber-cyan/10 border border-cyber-cyan/30 shadow-glow-cyan' 
                        : 'glass hover:bg-white/5 border border-white/5'
                  }`}
               >
                  {/* Status Background Pill */}
                  <div 
                     className="absolute top-0 right-0 px-2 py-1 bg-black/60 rounded-bl-lg border-l border-b border-black/40 font-bold tracking-wider text-[8px] uppercase"
                     style={{ color: risk.color }}
                  >
                     {risk.label}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3 mt-1">
                     <span className={`text-xl font-bold font-mono tracking-tight ${isActive ? 'text-cyber-cyan' : 'text-slate-300'}`}>
                        {station.id}
                     </span>
                     <span className="text-[10px] uppercase text-slate-500 font-medium truncate">
                        {station.name}, {station.country}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-slate-400 uppercase">
                     <div>
                        <span className="block text-[8px] text-slate-600 tracking-wider">Latitude</span>
                        <span className={isActive ? 'text-white' : ''}>{station.lat.toFixed(2)}°</span>
                     </div>
                     <div>
                        <span className="block text-[8px] text-slate-600 tracking-wider">Longitude</span>
                        <span className={isActive ? 'text-white' : ''}>{station.lon.toFixed(2)}°</span>
                     </div>
                  </div>

                  <hr className={`my-3 border-dashed ${isActive ? 'border-cyber-cyan/30' : 'border-white/10'}`} />

                  <div className="flex items-end justify-between min-h-[30px]">
                     {liveData ? (
                        <>
                           <div>
                              <span className="block text-[9px] tracking-[0.15em] text-slate-300 uppercase mb-0.5">Pred Ex</span>
                              <span className="text-sm font-mono text-white font-semibold">
                                 {liveData.predEx !== null ? liveData.predEx.toFixed(2) : '—'}
                              </span>
                           </div>
                           <div className="text-right">
                              <span className="block text-[9px] tracking-[0.15em] text-slate-300 uppercase mb-0.5">Pred Ey</span>
                              <span className="text-sm font-mono text-white font-semibold">
                                 {liveData.predEy !== null ? liveData.predEy.toFixed(2) : '—'}
                              </span>
                           </div>
                        </>
                     ) : (
                        <div className="w-full text-center py-1">
                           <span className="text-[9px] text-slate-600 tracking-widest uppercase">Select to simulate</span>
                        </div>
                     )}
                  </div>
               </button>
            )
         })}
      </div>
    </div>
  );
}
