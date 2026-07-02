import { MEMBERS } from '../../config/members';
import { Eyes, Mouth } from './parts';

const M = MEMBERS.aym;

/** Aym: cabeza OVALADA, nariz ANCHA, pelo corto. */
export function AvatarAym() {
  return (
    <group>
      {/* cabeza ovalada */}
      <mesh position={[0, 0.55, 0]} scale={[0.9, 1.25, 0.95]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      {/* pelo corto (casquete) */}
      <mesh position={[0, 0.92, -0.1]} scale={[0.95, 0.85, 0.95]}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* nariz ancha */}
      <mesh position={[0, 0.48, 0.56]}>
        <boxGeometry args={[0.42, 0.17, 0.22]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      <Eyes y={0.72} x={0.24} z={0.5} />
      <Mouth y={0.2} z={0.52} width={0.3} />
      {/* torso */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.35, 1.05, 0.7]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
    </group>
  );
}
