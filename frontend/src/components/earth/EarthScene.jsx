import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload } from '@react-three/drei';
import Earth from './Earth';
import Atmosphere from './Atmosphere';
import StationMarkers from './StationMarkers';
import SolarWind from './SolarWind';

export default function EarthScene({ sim, onSelectStation }) {
  const progress = sim.totalSteps > 0 ? sim.currentStep / sim.totalSteps : 0;
  const intensity = 0.5 + progress * 1.5; // Storm intensity drives visuals

  return (
    <div className="earth-canvas rounded-xl overflow-hidden relative" style={{ height: '560px' }}>
      <Canvas
        camera={{ position: [0, 1.5, 3.5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 3, 5]} intensity={0.8} color="#cce8ff" />
          <pointLight position={[-5, 2, -5]} intensity={0.2} color="#4060ff" />

          {/* Globe */}
          <Earth selectedStation={sim.selectedStation} />
          <Atmosphere intensity={intensity} />

          {/* Stations */}
          <StationMarkers
            selectedStation={sim.selectedStation}
            onSelect={onSelectStation}
            currentData={sim.simulationData[sim.simulationData.length - 1]}
          />

          {/* Solar wind stream */}
          <SolarWind intensity={intensity} />

          {/* Stars */}
          <Stars radius={60} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            rotateSpeed={0.5}
            zoomSpeed={0.6}
            autoRotate
            autoRotateSpeed={0.15}
          />

          <Preload all />
        </Suspense>
      </Canvas>

      {/* Corner label */}
      <div className="absolute top-3 left-3 text-[9px] tracking-[0.2em] text-cyber-cyan/40 uppercase pointer-events-none">
        Interactive 3D · Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
