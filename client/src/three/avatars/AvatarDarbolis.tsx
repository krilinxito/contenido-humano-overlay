import { MEMBERS } from '../../config/members';
import { Eyes, Glasses, Mouth } from './parts';

const M = MEMBERS.darbolis;

// Posiciones de los granos en mejillas y frente (x, y, z sobre la cara).
const GRANOS: [number, number, number][] = [
  [-0.32, 0.42, 0.42],
  [0.36, 0.5, 0.4],
  [-0.24, 0.9, 0.38],
  [0.2, 0.32, 0.46],
  [0.38, 0.86, 0.34],
  [-0.38, 0.62, 0.38],
];

/** Darbolis: flaco, cara con granos, lentes, cerquillo partido en dos. */
export function AvatarDarbolis() {
  return (
    <group>
      {/* cabeza flaca y alargada */}
      <mesh position={[0, 0.55, 0]} scale={[0.74, 1.28, 0.85]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      {/* casco de pelo */}
      <mesh position={[0, 0.95, -0.1]} scale={[0.78, 0.85, 0.88]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* cerquillo partido en dos mitades */}
      <mesh position={[-0.19, 1.02, 0.36]} rotation={[0.25, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.22, 0.15]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      <mesh position={[0.19, 1.02, 0.36]} rotation={[0.25, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.22, 0.15]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* granos */}
      {GRANOS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <icosahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial color="#ff3ea5" flatShading />
        </mesh>
      ))}
      <Glasses y={0.66} z={0.42} />
      <Eyes y={0.66} x={0.22} z={0.38} size={0.06} />
      <Mouth y={0.16} z={0.42} width={0.24} />
      {/* torso flaco */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.1, 1.05, 0.55]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
    </group>
  );
}
