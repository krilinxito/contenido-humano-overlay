import { useRef, type ComponentType } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { MemberId } from '../../config/members';
import { AvatarChavez } from './AvatarChavez';
import { AvatarAym } from './AvatarAym';
import { AvatarMots } from './AvatarMots';
import { AvatarDarbolis } from './AvatarDarbolis';
import { AvatarKrilin } from './AvatarKrilin';

const AVATARS: Record<MemberId, ComponentType> = {
  chavez: AvatarChavez,
  aym: AvatarAym,
  mots: AvatarMots,
  darbolis: AvatarDarbolis,
  krilin: AvatarKrilin,
};

interface Avatar3DProps {
  member: MemberId;
  /** Desfase de la animación idle para que varios avatares no se muevan en sincronía. */
  bobOffset?: number;
  position?: [number, number, number];
  scale?: number;
}

/** Busto low-poly del miembro con idle animation (bob + vaivén). */
export function Avatar3D({ member, bobOffset = 0, position = [0, 0, 0], scale = 1 }: Avatar3DProps) {
  const ref = useRef<Group>(null);
  const Avatar = AVATARS[member];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + bobOffset;
    // El bob escala con el avatar: a escalas chicas (créditos del Outro)
    // una amplitud fija se vuelve un salto desproporcionado.
    ref.current.position.y = position[1] + Math.sin(t * 2.2) * 0.08 * scale;
    ref.current.rotation.y = Math.sin(t * 0.9) * 0.35;
    ref.current.rotation.z = Math.sin(t * 1.4) * 0.03;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <Avatar />
    </group>
  );
}
