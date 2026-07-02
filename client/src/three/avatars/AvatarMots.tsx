import { MEMBERS } from '../../config/members';
import { Eyes, Mouth } from './parts';

const M = MEMBERS.mots;

/** Mots: el más moreno, con CERQUILLO. */
export function AvatarMots() {
  return (
    <group>
      {/* cabeza */}
      <mesh position={[0, 0.55, 0]} scale={[0.95, 1.1, 0.95]}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      {/* casco de pelo */}
      <mesh position={[0, 0.88, -0.08]} scale={[1, 0.9, 1]}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* cerquillo sobre la frente */}
      <mesh position={[0, 0.98, 0.42]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.85, 0.22, 0.18]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      {/* nariz */}
      <mesh position={[0, 0.5, 0.55]}>
        <boxGeometry args={[0.2, 0.16, 0.18]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      <Eyes y={0.7} x={0.24} z={0.48} />
      <Mouth y={0.22} z={0.5} width={0.3} />
      {/* torso */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.4, 1.05, 0.72]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
    </group>
  );
}
