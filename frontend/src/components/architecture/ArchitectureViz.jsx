import React from 'react';
import { Network, Database, Layers } from 'lucide-react';
import { ARCHITECTURE_NODES } from '../../data/constants';

export default function ArchitectureViz() {
  return (
    <div className="glass rounded-xl p-5 md:p-8 flex flex-col md:flex-row gap-8 items-center bg-black/40 relative overflow-hidden">
        {/* Animated background data lines */}
        <div className="absolute inset-0 flex flex-col justify-evenly opacity-20 pointer-events-none">
           {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[1px] w-full data-flow-line" style={{ animationDelay: `${i * 0.4}s` }} />
           ))}
        </div>

        <div className="w-full md:w-1/3 z-10">
           <div className="flex items-center gap-3 mb-3">
              <Network className="w-6 h-6 text-cyber-purple" strokeWidth={1.5} />
              <h2 className="text-lg font-bold text-white tracking-wide">GICTransformer Architecture</h2>
           </div>
           <p className="text-[11px] leading-relaxed text-slate-400 mb-6 font-medium">
              The project utilizes a PyTorch-based Transformer Encoder with multimodal input fusion. 
              Time-series solar wind data is projected into a d_model latency space, while ground-station 
              metadata is embedded via a Gated Residual Network (GRN).
           </p>
           
           <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-wider font-mono">
              <div className="glass px-3 py-2 rounded-lg border border-cyber-purple/20">
                 <div className="text-slate-500 mb-1">d_model</div>
                 <div className="text-cyber-purple font-bold text-sm">64</div>
              </div>
              <div className="glass px-3 py-2 rounded-lg border border-cyber-blue/20">
                 <div className="text-slate-500 mb-1">Heads</div>
                 <div className="text-cyber-blue font-bold text-sm">4</div>
              </div>
              <div className="glass px-3 py-2 rounded-lg border border-neon-green/20">
                 <div className="text-slate-500 mb-1">Layers</div>
                 <div className="text-neon-green font-bold text-sm">3</div>
              </div>
              <div className="glass px-3 py-2 rounded-lg border border-cyber-cyan/20">
                 <div className="text-slate-500 mb-1">Feedforward</div>
                 <div className="text-cyber-cyan font-bold text-sm">256</div>
              </div>
           </div>
        </div>

        <div className="flex-1 flex justify-center z-10 w-full overflow-x-auto pb-4">
           <div className="flex items-center gap-1 min-w-[700px]">
              {ARCHITECTURE_NODES.map((node, i) => (
                 <React.Fragment key={node.id}>
                    <div className="group relative flex flex-col items-center">
                       {/* Node Box */}
                       <div className="w-[100px] h-[64px] glass rounded-lg flex items-center justify-center border border-white/10 group-hover:border-cyber-purple/60 group-hover:bg-cyber-purple/10 transition-colors shadow-xl cursor-default relative">
                          <p className="text-[9px] text-center uppercase tracking-widest font-semibold p-1">
                             {node.label}
                          </p>
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-[220px] glass-strong border border-white/20 p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                             <p className="text-[10px] text-slate-300 leading-relaxed font-sans normal-case">
                                {node.desc}
                             </p>
                             <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-solid border-t-white/20 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                          </div>
                       </div>
                    </div>
                    {/* Connector Arrow */}
                    {i < ARCHITECTURE_NODES.length - 1 && (
                       <div className="w-6 h-0.5 relative flex-1 bg-white/10 mx-1">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent bg-[length:200%_100%] animate-[data-flow_1.5s_linear_infinite]" />
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-l-white/30 border-l-[4px] border-y-transparent border-y-[3px] border-r-0 translate-x-[2px]"></div>
                       </div>
                    )}
                 </React.Fragment>
              ))}
           </div>
        </div>
    </div>
  );
}
