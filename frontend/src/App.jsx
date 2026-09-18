import React, { useState, useEffect } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { useSimulation } from './hooks/useSimulation';
import LoadingScreen from './components/layout/LoadingScreen';
import Navbar from './components/layout/Navbar';
import HeroStatus from './components/hero/HeroStatus';
import AlertCenter from './components/hero/AlertCenter';
import EarthScene from './components/earth/EarthScene';
import SolarWindPanel from './components/earth/SolarWindPanel';
import SimControls from './components/simulation/SimControls';
import StormTimeline from './components/simulation/StormTimeline';
import ForecastPanel from './components/forecast/ForecastPanel';
import ForecastChart from './components/forecast/ForecastChart';
import StationsGrid from './components/stations/StationsGrid';
import ArchitectureViz from './components/architecture/ArchitectureViz';
import DataPipeline from './components/architecture/DataPipeline';
import ModelPerformance from './components/performance/ModelPerformance';
import { STATIONS } from './data/constants';

function DashboardContent() {
  const sim = useSimulation();
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Set default station on load
  useEffect(() => {
    if (!sim.selectedStation && STATIONS.length > 0) {
      sim.selectStation(STATIONS[0]);
    }
  }, [sim.selectedStation, sim.selectStation]);

  const lastData = sim.simulationData[sim.simulationData.length - 1];

  return (
    <div className="min-h-screen bg-space-950 text-slate-300 relative selection:bg-cyber-cyan/30 selection:text-white">
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40 z-0" />

      {/* Navbar */}
      <Navbar apiStatus={sim.apiStatus} currentTimestamp={lastData?.timestamp} />

      {/* Main Content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
        
        {/* Section 1: Hero & Status */}
        <section id="overview" className="pt-4">
          <HeroStatus sim={sim} />
          <div className="mt-4">
             <AlertCenter sim={sim} />
          </div>
        </section>

        {/* Section 2: 3D Visualization & Telemetry */}
        <section id="earth" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
             <EarthScene sim={sim} onSelectStation={sim.selectStation} />
          </div>
          <div className="lg:col-span-1">
             <SolarWindPanel sim={sim} />
          </div>
        </section>

        {/* Section 3: Simulation Engine & Controls */}
        <section id="simulation" className="space-y-4">
          <SimControls sim={sim} />
          <StormTimeline currentStep={sim.currentStep} totalSteps={sim.totalSteps} />
        </section>

        {/* Section 4: Forecast & Charting */}
        <section id="forecast" className="space-y-6">
          <ForecastPanel sim={sim} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                <ForecastChart sim={sim} />
             </div>
             <div className="lg:col-span-1">
                <ModelPerformance sim={sim} />
             </div>
          </div>
        </section>

        {/* Section 5: Ground Stations */}
        <section id="stations">
          <StationsGrid sim={sim} />
        </section>

        {/* Section 6: Architecture & Pipeline */}
        <section id="architecture" className="space-y-6">
          <ArchitectureViz />
        </section>

        <section id="pipeline">
          <DataPipeline />
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 bg-black/40 text-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
        GICTransformer Monitoring System · PyTorch + React + Three.js
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
}
