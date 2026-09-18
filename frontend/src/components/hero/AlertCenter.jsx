import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getRiskLevel } from '../../data/constants';

export default function AlertCenter({ sim }) {
  const lastData = sim.simulationData[sim.simulationData.length - 1];
  const val = lastData?.predEmag ?? lastData?.predEx ?? null;

  const risk = val !== null ? getRiskLevel(val) : { label: 'STANDBY', color: '#4a5568' };

  let Icon = ShieldCheck;
  let bgStyle = 'bg-neon-green/5 border-neon-green/20';
  let textStyle = 'text-neon-green';

  if (risk.label === 'WARNING') {
     Icon = AlertTriangle;
     bgStyle = 'bg-neon-yellow/5 border-neon-yellow/20';
     textStyle = 'text-neon-yellow';
  } else if (risk.label === 'CRITICAL') {
     Icon = ShieldAlert;
     bgStyle = 'bg-neon-red/5 border-neon-red/20';
     textStyle = 'text-neon-red';
  }

  return (
    <div className={`glass rounded-xl p-4 border flex items-center justify-between ${bgStyle} transition-colors duration-500`}>
       <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${textStyle} shrink-0`} />
          <div>
             <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Grid Threat Advisory</h4>
             <p className={`text-xs font-mono font-bold tracking-wider ${textStyle}`}>
                {val !== null ? `STATUS: ${risk.label} (${val.toFixed(2)} V/km)` : 'STANDBY - AWAITING STREAM'}
             </p>
          </div>
       </div>

       <div className="hidden sm:block text-right text-[9px] text-slate-500 font-mono">
          THRESHOLD: 1.0 V/km
       </div>
    </div>
  );
}
