import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { RetroCanvas } from './RetroCanvas';

// Escena compartida de objetos low-poly flotantes. Regla dura
// (DESIGN_SYSTEM.md): flatShading siempre, geometrías con pocas
// subdivisiones, luz direccional dura, colores solo de la paleta.

const PALETTE = {
  teal: '#00c9a7',
  lime: '#b4f461',
  magenta: '#ff3ea5',
  purple: '#7b2ff7',
  blue: '#3d7eff',
  yellow: '#ffe135',
};

function Spinner({
  children,
  speed = 0.5,
  position,
}: {
  children: React.ReactNode;
  speed?: number;
  position: [number, number, number];
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 1.4;
  });
  return (
    <mesh ref={ref} position={position}>
      {children}
    </mesh>
  );
}

function FloatingShapes() {
  return (
    <>
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
        <Spinner position={[-3.2, 1.1, 0]} speed={0.6}>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshStandardMaterial color={PALETTE.magenta} flatShading />
        </Spinner>
      </Float>
      <Float speed={1.8} rotationIntensity={2} floatIntensity={1.5}>
        <Spinner position={[3.1, -0.6, -1]} speed={0.9}>
          <coneGeometry args={[0.9, 1.7, 6]} />
          <meshStandardMaterial color={PALETTE.teal} flatShading />
        </Spinner>
      </Float>
      <Float speed={3.2} rotationIntensity={1} floatIntensity={2.5}>
        <Spinner position={[0.4, 1.8, -2]} speed={0.4}>
          <octahedronGeometry args={[1.05, 0]} />
          <meshStandardMaterial color={PALETTE.lime} flatShading />
        </Spinner>
      </Float>
      <Float speed={2.1} rotationIntensity={1.6} floatIntensity={1.8}>
        <Spinner position={[-1.4, -1.7, -0.5]} speed={1.2}>
          <torusGeometry args={[0.8, 0.32, 5, 8]} />
          <meshStandardMaterial color={PALETTE.purple} flatShading />
        </Spinner>
      </Float>
      <Float speed={2.8} rotationIntensity={0.8} floatIntensity={2.2}>
        <Spinner position={[2.4, 1.9, -3]} speed={0.7}>
          <dodecahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color={PALETTE.yellow} flatShading />
        </Spinner>
      </Float>
      <Float speed={1.5} rotationIntensity={1.4} floatIntensity={1.2}>
        <Spinner position={[-2.6, -0.2, -2.5]} speed={0.5}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={PALETTE.blue} flatShading />
        </Spinner>
      </Float>
    </>
  );
}

export function LowPolyScene({ className = '' }: { className?: string }) {
  return (
    <RetroCanvas
      className={className}
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ position: 'absolute', inset: 0 }}
      // Decoración de fondo: a 12fps ni se nota y es la mitad de GPU
      fps={12}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <FloatingShapes />
    </RetroCanvas>
  );
}
