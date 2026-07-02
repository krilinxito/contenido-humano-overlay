import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { RetroCanvas } from '../../three/RetroCanvas';
import { SPRING_TORPE } from '../motionPresets';
import './SapoRandom.css';

// Sapo low-poly hecho con primitivas (flatShading siempre, ver DESIGN_SYSTEM.md).
function Sapo() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Saltitos tontos + giro lento
    ref.current.position.y = Math.abs(Math.sin(t * 5)) * 0.55 - 0.4;
    ref.current.rotation.y = Math.sin(t * 1.8) * 0.9;
    ref.current.rotation.z = Math.sin(t * 7) * 0.06;
  });

  return (
    <group ref={ref}>
      {/* cuerpo */}
      <mesh scale={[1.25, 0.85, 1]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#b4f461" flatShading />
      </mesh>
      {/* panza */}
      <mesh position={[0, -0.25, 0.55]} scale={[0.8, 0.55, 0.5]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#f4f9ff" flatShading />
      </mesh>
      {/* ojos */}
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0.75, 0.35]}>
          <mesh>
            <icosahedronGeometry args={[0.32, 0]} />
            <meshStandardMaterial color="#f4f9ff" flatShading />
          </mesh>
          <mesh position={[0, 0.05, 0.22]}>
            <icosahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#0d0d0d" flatShading />
          </mesh>
        </group>
      ))}
      {/* patas delanteras */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, -0.75, 0.4]} rotation={[0.9, 0, x > 0 ? -0.4 : 0.4]}>
          <coneGeometry args={[0.22, 0.7, 5]} />
          <meshStandardMaterial color="#8fd93e" flatShading />
        </mesh>
      ))}
    </group>
  );
}

const FRASES = ['berp', 'croac?', 'no me juzgues', '...', 'CONTENIDO', 'hola soy el sapo'];

/** Un sapo low-poly aparece en una posición random, salta, dice algo, se va (~4s). */
export function SapoRandom() {
  // Posición y frase random, calculadas una vez por aparición.
  const { top, left, frase, flip } = useMemo(
    () => ({
      top: 12 + Math.random() * 48,
      left: 8 + Math.random() * 64,
      frase: FRASES[Math.floor(Math.random() * FRASES.length)],
      flip: Math.random() > 0.5,
    }),
    [],
  );

  return (
    <div className="gag-root sapo-random">
      <motion.div
        className="sapo-random__stage"
        style={{ top: `${top}%`, left: `${left}%` }}
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0, transition: SPRING_TORPE }}
        exit={{ scale: 0, rotate: 25, y: 250, transition: { duration: 0.25, ease: [0.6, -0.4, 1, 0.4] } }}
      >
        <RetroCanvas camera={{ position: [0, 0.4, 4.2], fov: 45 }}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} />
          {/* el flip va acá adentro: mezclar scaleX en el style de framer
              con su animación de scale rompe la entrada/salida */}
          <group scale={[flip ? -1 : 1, 1, 1]}>
            <Sapo />
          </group>
        </RetroCanvas>
        <motion.div
          className="sapo-random__bubble"
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { ...SPRING_TORPE, delay: 0.5 } }}
        >
          {frase}
        </motion.div>
      </motion.div>
    </div>
  );
}
