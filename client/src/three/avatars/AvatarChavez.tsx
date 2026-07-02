import { MEMBERS } from '../../config/members';
import { Eyes, Glasses, Mouth } from './parts';

const M = MEMBERS.chavez;

/** Edmundo/Chavez: gordito, lentes, pelo corto, cabeza CUADRADA. */
export function AvatarChavez() {
  return (
    <group>
      {/* cabeza cuadrada */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.05, 0.95, 0.95]} />
        <meshStandardMaterial color={M.skin} flatShading />
      </mesh>
      {/* pelo corto (tapa) */}
      <mesh position={[0, 1.1, -0.04]}>
        <boxGeometry args={[1.12, 0.26, 1.0]} />
        <meshStandardMaterial color={M.hair} flatShading />
      </mesh>
      <Glasses y={0.66} z={0.5} />
      <Eyes y={0.66} z={0.44} size={0.07} />
      <Mouth y={0.26} z={0.5} />
      {/* torso gordito */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[1.9, 1.1, 0.95]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
      {/* panza */}
      <mesh position={[0, -0.85, 0.4]} scale={[1.1, 0.75, 0.5]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={M.color} flatShading />
      </mesh>
    </group>
  );
}
