import type { MemberId } from '../../config/members';
import { RetroCanvas } from '../RetroCanvas';
import { Avatar3D } from './Avatar3D';

interface AvatarBustProps {
  member: MemberId;
  className?: string;
}

/**
 * Canvas chico con el busto de un miembro, tipo PFP.
 * Para usar dentro de badges y UI 2D (fondo transparente, luz dura).
 */
export function AvatarBust({ member, className = '' }: AvatarBustProps) {
  return (
    <RetroCanvas
      className={className}
      camera={{ position: [0, 0.25, 3.4], fov: 42 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <Avatar3D member={member} />
    </RetroCanvas>
  );
}
