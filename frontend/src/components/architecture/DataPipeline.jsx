import React from 'react';
import { GitCommit } from 'lucide-react';
import { PIPELINE_NODES } from '../../data/constants';

export default function DataPipeline() {
  return (
    <div className="glass rounded-xl p-5 md:p-8 bg-black/30 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <GitCommit className="w-6 h-6 text-cyber-cyan" strokeWidth={1.5} />
        <div>
           <h2 className="text-lg font-bold text-white tracking-wide">Data Processing & Feature Pipeline</h2>
           <p className="text-[11px] text-slate-400">End-to-end data transformation pipeline from OMNI/SuperMAG raw feeds to physical predictions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
         {PIPELINE_NODES.map((step, idx) => (
            <div key={step.id} className="glass rounded-lg p-3 border border-white/5 flex flex-col justify-between group hover:border-cyber-cyan/40 transition-colors relative">
               <div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[9px] font-mono text-cyber-cyan font-bold">0{idx + 1}</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/40 group-hover:bg-cyber-cyan" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{step.label}</h3>
                  <p className="text-[9px] text-slate-400 leading-relaxed font-sans">{step.desc}</p>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
