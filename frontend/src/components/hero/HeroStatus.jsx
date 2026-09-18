import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Cpu, Radio, MapPin, Gauge } from 'lucide-react';
import { getStormPhase, MODEL_CONFIG } from '../../data/constants';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function HeroStatus({ sim }) {
  const progress = sim.totalSteps > 0 ? sim.currentStep / sim.totalSteps : 0;
  const phase = getStormPhase(progress);
  const lastData = sim.simulationData[sim.simulationData.length - 1];
  const connected = sim.apiStatus === 'connected';

  const cards = [
    {
      icon: Activity, label: 'STORM STATUS',
      value: sim.initialized ? phase.label : '—',
      color: sim.initialized ? phase.color : '#4a5568',
    },
    {
      icon: Clock, label: 'SIM TIME',
      value: lastData?.timestamp || '—',
      color: '#00f0ff',
    },
    {
      icon: Gauge, label: 'PRED HORIZON',
      value: `${MODEL_CONFIG.pred_lead_mins} min`,
      color: '#8b5cf6',
    },
    {
      icon: Cpu, label: 'MODEL',
      value: connected ? 'ONLINE' : 'OFFLINE',
      color: connected ? '#00ff88' : '#ff003c',
    },
    {
      icon: Radio, label: 'API',
      value: connected ? 'CONNECTED' : 'OFFLINE',
      color: connected ? '#00ff88' : '#ff003c',
    },
    {
      icon: MapPin, label: 'STATION',
      value: sim.selectedStation?.id || 'NONE',
      color: '#ffd000',
    },
  ];

  return (
    <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-cyan/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text mb-3 tracking-tight">
            Geomagnetic Storm Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Transformer-based forecasting for space-weather-driven grid risk.
          </p>
          <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase mt-2">
            December 6, 2015 Storm Event
          </p>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {cards.map((card) => (
            <motion.div
              key={card.label}
              variants={item}
              className="glass rounded-lg p-3 text-center relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              {/* Scanline */}
              <div className="absolute inset-0 scanline opacity-0 group-hover:opacity-100 transition-opacity" />

              <card.icon className="w-4 h-4 mx-auto mb-2 text-slate-500" strokeWidth={1.5} />
              <p className="text-[9px] tracking-[0.15em] text-slate-500 uppercase mb-1">
                {card.label}
              </p>
              <p
                className="text-sm font-bold font-mono tracking-wide"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
              {/* Glow dot */}
              <span
                className="status-dot mx-auto mt-2"
                style={{ backgroundColor: card.color, color: card.color }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
