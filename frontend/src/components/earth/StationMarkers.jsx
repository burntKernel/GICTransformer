import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { STATIONS, latLonToVec3, getRiskLevel } from '../../data/constants';

export default function StationMarkers({ selectedStation, onSelect, currentData }) {
  return (
    <group>
      {STATIONS.map((station) => (
        <StationPin
          key={station.id}
          station={station}
          isSelected={selectedStation?.id === station.id}
          onClick={() => onSelect(station)}
          currentData={currentData}
        />
      ))}
    </group>
  );
}

function StationPin({ station, isSelected, onClick, currentData }) {
  const position = useMemo(() => latLonToVec3(station.lat, station.lon, 1.025), [station]);

  // Derive current value for styling
  const val = currentData?.predEmag ?? currentData?.predEx ?? null;
  const risk = val !== null ? getRiskLevel(val) : null;
  const pinColor = isSelected ? '#ff003c' : (risk?.color || '#00ff88');

  return (
    <group position={position}>
      {/* Marker sphere */}
      <mesh onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'default'; }}>
        <sphereGeometry args={[isSelected ? 0.028 : 0.02, 16, 16]} />
        <meshBasicMaterial color={pinColor} transparent opacity={0.9} />
      </mesh>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.045, 32]} />
        <meshBasicMaterial color={pinColor} transparent opacity={isSelected ? 0.5 : 0.2} side={2} depthWrite={false} />
      </mesh>

      {/* Label */}
      <Html
        distanceFactor={4}
        position={[0, 0.06, 0]}
        style={{ pointerEvents: isSelected ? 'auto' : 'none', userSelect: 'none' }}
        center
      >
        <div
          className={`whitespace-nowrap text-center transition-all duration-200 ${
            isSelected ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
          }`}
          style={{ transform: 'translateY(-100%)' }}
        >
          {/* ID label always visible */}
          <div
            className="text-[9px] tracking-[0.15em] font-bold px-1.5 py-0.5 rounded"
            style={{ color: pinColor, textShadow: `0 0 8px ${pinColor}40` }}
          >
            {station.id}
          </div>

          {/* Expanded info on select */}
          {isSelected && (
            <div className="glass rounded-lg p-2.5 mt-1 text-left min-w-[140px] border border-white/10">
              <p className="text-[10px] font-semibold text-white mb-1">{station.name}</p>
              <div className="space-y-0.5 text-[9px] font-mono text-slate-400">
                <p>LAT {station.lat.toFixed(2)}°</p>
                <p>LON {station.lon.toFixed(2)}°</p>
                {currentData && currentData.predEx !== null && (
                  <>
                    <hr className="border-white/5 my-1" />
                    <p>
                      Ex{' '}
                      <span className="text-cyber-cyan">{currentData.predEx.toFixed(3)}</span>{' '}
                      V/km
                    </p>
                    {currentData.predEy !== null && (
                      <p>
                        Ey{' '}
                        <span className="text-cyber-cyan">{currentData.predEy.toFixed(3)}</span>{' '}
                        V/km
                      </p>
                    )}
                    {currentData.predEmag !== null && (
                      <p>
                        Emag{' '}
                        <span className="text-cyber-cyan">{currentData.predEmag.toFixed(3)}</span>{' '}
                        V/km
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
