import { MEMBERS } from '../../config/members';
import { Eyes, Mouth } from './parts';

const M = MEMBERS.krilin;

/** Krilin: pelo LARGO, nariz GRANDE. */
export function AvatarKrilin() {
  return (
    <group>
      {/* cabeza */}
      <mesh position={[0, 0.55, 0]} scale={[0.9, 1.08, 0.9]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      {/* casco de pelo */}
      <mesh position={[0, 0.9, -0.08]} scale={[0.98, 0.9, 0.98]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* melena: cortinas laterales + panel trasero */}
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.15, -0.08]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.24, 1.25, 0.55]} />
          <meshStandardMaterial color={M.hair} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.1, -0.42]}>
        <boxGeometry args={[1.0, 1.4, 0.24]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* nariz grande (cono apuntando al frente) */}
      <mesh position={[0, 0.5, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.16, 0.55, 5]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      <Eyes y={0.72} x={0.25} z={0.48} />
      <Mouth y={0.2} z={0.5} width={0.28} />
      {/* torso */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.35, 1.05, 0.7]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
    </group>
  );
}
