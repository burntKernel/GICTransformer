import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Stylised holographic Earth globe.
 * Dark sphere + wireframe grid overlay. No external textures needed.
 */
export default function Earth({ selectedStation }) {
  const groupRef = useRef();
  const targetRotationY = useRef(null);

  // When a station is selected, smoothly rotate to face it
  useEffect(() => {
    if (selectedStation) {
      targetRotationY.current = -selectedStation.lon * (Math.PI / 180) - Math.PI * 0.5;
    } else {
      targetRotationY.current = null;
    }
  }, [selectedStation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (targetRotationY.current !== null) {
      // Lerp toward target
      const diff = targetRotationY.current - groupRef.current.rotation.y;
      const shortDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      groupRef.current.rotation.y += shortDiff * Math.min(delta * 2, 1);
      if (Math.abs(shortDiff) < 0.01) targetRotationY.current = null;
    }
  });

  // Continent-hint shader (produces dark continents via noise)
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;

        // Simple noise for land-mass hints
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          // Base ocean color
          vec3 ocean = vec3(0.03, 0.06, 0.14);
          vec3 land  = vec3(0.06, 0.10, 0.20);

          // Noise-based land
          float n = noise(vUv * 8.0) * 0.5 + noise(vUv * 16.0) * 0.3 + noise(vUv * 32.0) * 0.2;
          float landMask = smoothstep(0.48, 0.54, n);

          vec3 color = mix(ocean, land, landMask);

          // Fresnel edge lighting
          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
          color += vec3(0.0, 0.3, 0.5) * fresnel * 0.15;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main Earth sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Wireframe grid overlay */}
      <mesh>
        <sphereGeometry args={[1.004, 48, 24]} />
        <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.045} depthWrite={false} />
      </mesh>

      {/* Finer inner grid for detail */}
      <mesh>
        <sphereGeometry args={[1.002, 96, 48]} />
        <meshBasicMaterial color="#0060cc" wireframe transparent opacity={0.015} depthWrite={false} />
      </mesh>
    </group>
  );
}
