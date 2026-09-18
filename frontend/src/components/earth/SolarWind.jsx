import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 1200;

/**
 * Solar wind particle stream flowing from Sun direction toward Earth.
 * Purely visual — does not represent exact physical measurements.
 */
export default function SolarWind({ intensity = 1 }) {
  const pointsRef = useRef();

  const { positions, speeds, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = Math.random() * 30 - 5;       // x: spread across depth
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;   // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;   // z
      spd[i] = Math.random() * 0.03 + 0.015;

      // Color: warm yellow/orange far out → cool cyan near Earth
      const t = Math.random();
      col[i * 3]     = t * 0.8 + 0.2;   // R
      col[i * 3 + 1] = t * 0.6 + 0.4;   // G
      col[i * 3 + 2] = 1.0;              // B
    }
    return { positions: pos, speeds: spd, colors: col };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const colArray = pointsRef.current.geometry.attributes.color.array;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      posArray[ix] -= speeds[i] * intensity;

      // Reset when past Earth
      if (posArray[ix] < -6) {
        posArray[ix]     = 25 + Math.random() * 5;
        posArray[ix + 1] = (Math.random() - 0.5) * 12;
        posArray[ix + 2] = (Math.random() - 0.5) * 12;
      }

      // Color shift: warmer when far, cooler near Earth
      const dist = posArray[ix];
      const t = Math.max(0, Math.min(1, dist / 25));
      colArray[ix]     = t * 0.9;              // R fades
      colArray[ix + 1] = 0.5 + (1 - t) * 0.5; // G rises
      colArray[ix + 2] = 0.8 + (1 - t) * 0.2; // B stays high
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
