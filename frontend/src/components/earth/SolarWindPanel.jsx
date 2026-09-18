import React from 'react';
import { Satellite, AlertTriangle } from 'lucide-react';

/**
 * Solar wind telemetry overlay panel.
 * The current backend API does not expose raw IMF/solar-wind measurements,
 * so this panel clearly states that and shows only simulation-derived info.
 */
export default function SolarWindPanel({ sim }) {
  const lastData = sim.simulationData[sim.simulationData.length - 1];

  return (
    <div className="glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Satellite className="w-4 h-4 text-cyber-cyan" strokeWidth={1.5} />
        <h3 className="text-[11px] tracking-[0.15em] text-slate-300 uppercase font-semibold">
          Solar Wind Telemetry
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {[
          { label: 'SPEED',    unit: 'km/s' },
          { label: 'IMF Bx',   unit: 'nT' },
          { label: 'IMF By',   unit: 'nT' },
          { label: 'IMF Bz',   unit: 'nT' },
          { label: 'DENSITY',  unit: 'n/cm³' },
        ].map((field) => (
          <div key={field.label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
            <span className="text-[10px] tracking-wider text-slate-500 uppercase">{field.label}</span>
            <span className="text-[10px] font-mono text-slate-600">N/A</span>
          </div>
        ))}
      </div>

      {/* Data source notice */}
      <div className="mt-4 flex items-start gap-2 bg-yellow-500/5 rounded-lg p-2.5 border border-yellow-500/10">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500/60 shrink-0 mt-0.5" />
        <p className="text-[9px] text-yellow-500/50 leading-relaxed">
          Real-time solar wind parameters are not available from the current backend API.
          The particle visualization is illustrative only.
        </p>
      </div>

      {/* Simulation timestamp */}
      {lastData && (
        <div className="mt-3 text-center">
          <p className="text-[9px] tracking-wider text-slate-600 uppercase">Current Time</p>
          <p className="text-sm font-mono text-cyber-cyan mt-0.5">{lastData.timestamp}</p>
        </div>
      )}
    </div>
  );
}
