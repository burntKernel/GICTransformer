import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Atmosphere glow using a Fresnel back-side shader on a slightly larger sphere.
 */
export default function Atmosphere({ intensity = 1 }) {
  const meshRef = useRef();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uIntensity;
        void main() {
          float f = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 0.94, 1.0), f);
          gl_FragColor = vec4(color, f * 0.45 * uIntensity);
        }
      `,
      uniforms: {
        uIntensity: { value: intensity },
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame(() => {
    if (material.uniforms) {
      material.uniforms.uIntensity.value += (intensity - material.uniforms.uIntensity.value) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.18}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
