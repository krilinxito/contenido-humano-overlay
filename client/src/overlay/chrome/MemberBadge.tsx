import { useMemo } from 'react';
import { MEMBERS, randomAdjetivo, type MemberId } from '../../config/members';
import { AvatarBust } from '../../three/avatars/AvatarBust';
import './MemberBadge.css';

interface MemberBadgeProps {
  member: MemberId;
  /** 'lg' = protagonista (tertulia); 'sm' = mini badge para strips/grillas. */
  size?: 'lg' | 'sm';
  className?: string;
}

/** Sticker estilo Paint con el avatar 3D, nombre y un adjetivo random del pool. */
export function MemberBadge({ member, size = 'lg', className = '' }: MemberBadgeProps) {
  const data = MEMBERS[member];
  // Un adjetivo por aparición del badge (cambia al cambiar de miembro).
  const adjetivo = useMemo(() => randomAdjetivo(member), [member]);

  return (
    <div className={`member-badge member-badge--${size} ${className}`}>
      <div className="member-badge__card">
        {/* Los filtros (sticker + crayón) van SOLO en capas de fondo estáticas:
            #scribble sobre texto/canvas los vuelve ilegibles, y cualquier
            filtro sobre un subtree con Canvas vivo se re-rasteriza en cada
            frame 3D (regla en DESIGN_SYSTEM.md). Como .sticker y
            .scribble-border son ambos `filter:`, van en dos capas anidadas. */}
        <div className="member-badge__bg-wrap sticker">
          <div className="member-badge__bg scribble-border" style={{ background: data.color }} />
        </div>
        <div className="member-badge__avatar">
          <AvatarBust member={member} />
        </div>
        <div className="member-badge__nombre">{data.nombre}</div>
        {size === 'lg' && <div className="member-badge__adjetivo">“{adjetivo}”</div>}
      </div>
    </div>
  );
}
