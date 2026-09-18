import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, AlertCircle } from 'lucide-react';
import { SPEED_OPTIONS } from '../../data/constants';

export default function SimControls({ sim }) {
  const { isPlaying, loading, error, currentStep, totalSteps, speed } = sim;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  
  const connected = sim.apiStatus === 'connected';
  const disableControls = !connected || !sim.initialized || error;

  return (
    <div className="glass rounded-xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Header & Date */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] tracking-[0.2em] text-slate-400 uppercase font-semibold">
          Simulation Engine
        </h3>
        <p className="text-xs font-mono font-bold text-white tracking-widest bg-white/10 px-2 py-1 rounded">
          DEC 06 2015
        </p>
      </div>

      {/* Main Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={isPlaying ? sim.pause : sim.start}
          disabled={!connected || loading}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all min-w-[120px] ${
            isPlaying
              ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/50'
              : 'bg-cyber-blue/20 text-cyber-cyan hover:bg-cyber-blue/30 border border-cyber-cyan/50 hover:shadow-glow-cyan'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          {isPlaying ? 'Pause' : (sim.initialized && currentStep > 0 ? 'Resume' : 'Start')}
        </button>

        {/* Step Forward */}
        <button
          onClick={sim.nextStep}
          disabled={disableControls || isPlaying || loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Minute"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Step</span>
        </button>

        {/* Reset */}
        <button
          onClick={sim.reset}
          disabled={!sim.initialized || loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Speed Selector */}
        <div className="flex flex-1 sm:flex-none justify-end gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          {SPEED_OPTIONS.map((val) => (
            <button
              key={val}
              onClick={() => sim.setSpeed(val)}
              className={`px-2 py-1 text-[10px] font-mono font-semibold rounded ${
                speed === val
                  ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Error Area */}
      <div className="mt-1">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Progress</span>
          <span className="text-[10px] font-mono text-cyber-cyan font-semibold">
            {totalSteps > 0 ? `STEP ${currentStep} / ${totalSteps}` : 'NOT STARTED'}
          </span>
        </div>
        
        {/* Simple Progress Bar */}
        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status Messages */}
        <div className="h-5 mt-2 flex items-center">
          {loading && (
            <span className="text-[10px] text-cyber-blue animate-pulse">Requesting telemetry...</span>
          )}
          {error && (
            <div className="flex items-center gap-1.5 text-neon-red">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px]">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
