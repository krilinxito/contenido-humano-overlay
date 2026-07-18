import { MEMBERS, MEMBER_IDS, type MemberId } from '../../config/members';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { CamPlaceholder } from './CamPlaceholder';
import { Carita } from './Caritas';
import './CamCell.css';

interface CamCellProps {
  member: MemberId;
  /** Resalta la celda con borde grueso + halo amarillo. */
  highlight?: boolean;
  className?: string;
}

/**
 * Celda de cámara de un miembro: placeholder + nametag con su color.
 * Reusable en strips/filas/grillas (ScreenPlusCams, BUM, Penitencia...).
 */
export function CamCell({ member, highlight = false, className = '' }: CamCellProps) {
  const data = MEMBERS[member];
  const nombre = useOverlayStore((s) => getMemberName(s.texts, member));
  const camIndex = MEMBER_IDS.indexOf(member);
  return (
    <div
      className={`cam-cell bevel-out ${highlight ? 'cam-cell--highlight' : ''} ${className}`}
      style={highlight ? { borderColor: data.color } : undefined}
    >
      <CamPlaceholder label={`CAM ${camIndex + 1}`} index={camIndex} cam={member} />
      <span className="cam-cell__name" style={{ background: data.color }}>
        {/* Carita 2D barata: N celdas visibles + highlight animado, acá no van
            filtros (.sticker) — regla de rendimiento en DESIGN_SYSTEM.md. */}
        <Carita member={member} size={22} className="cam-cell__carita" />
        {nombre}
      </span>
    </div>
  );
}
