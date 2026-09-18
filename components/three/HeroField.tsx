'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders/field';
function Field({ paused }: { paused: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const pointerTarget = useMemo(() => new THREE.Vector2(), []);
  const positions = useMemo(() => {
    const p = new Float32Array(4000 * 3);
    for (let i = 0; i < 80; i++)
      for (let j = 0; j < 50; j++) {
        const n = (i * 50 + j) * 3;
        p[n] = (i / 79 - 0.5) * 11;
        p[n + 1] = (j / 49 - 0.5) * 7;
        p[n + 2] = 0;
      }
    return p;
  }, []);
  const uniforms = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(100, 100) },
      uSlate: { value: new THREE.Color(style.getPropertyValue('--color-slate').trim()) },
      uLow: { value: new THREE.Color(style.getPropertyValue('--color-low').trim()) },
      uMedium: { value: new THREE.Color(style.getPropertyValue('--color-medium').trim()) },
    };
  }, []);
  useEffect(
    () => () => {
      material.current?.dispose();
    },
    [],
  );
  useFrame(({ pointer }, delta) => {
    if (paused || !material.current) return;
    elapsed.current += Math.min(delta, 0.05);
    material.current.uniforms.uTime.value = elapsed.current;
    material.current.uniforms.uPointer.value.lerp(
      pointerTarget.set(pointer.x * 5, pointer.y * 4),
      1 - Math.exp(-3 * Math.min(delta, 0.05)),
    );
  });
  return (
    <points rotation={[-0.72, -0.15, -0.45]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
export default function HeroField({ paused }: { paused: boolean }) {
  return (
    <div className="webgl-field">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 10], fov: 48 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop={paused ? 'demand' : 'always'}
      >
        <Field paused={paused} />
      </Canvas>
    </div>
  );
}
