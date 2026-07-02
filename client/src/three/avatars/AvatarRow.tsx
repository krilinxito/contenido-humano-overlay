import { useThree } from '@react-three/fiber';
import { MEMBERS, type MemberId } from '../../config/members';
import { RetroCanvas } from '../RetroCanvas';
import { Avatar3D } from './Avatar3D';
import './AvatarRow.css';

// UN solo Canvas para filas de avatares. Regla dura (DESIGN_SYSTEM.md):
// nunca montar N AvatarBust a la vez — cada Canvas es un contexto WebGL y
// el navegador descarta los más viejos (avatares en negro, sapo muerto).

function RowShapes({ members }: { members: MemberId[] }) {
  // viewport.width = ancho visible en unidades de mundo al z de la cámara →
  // posicionar en fracciones iguales coincide EXACTO con las columnas HTML.
  const viewport = useThree((s) => s.viewport);
  const n = members.length;
  return (
    <>
      {members.map((id, i) => (
        <Avatar3D
          key={id}
          member={id}
          position={[viewport.width * ((i + 0.5) / n - 0.5), 0, 0]}
          bobOffset={i * 1.3}
          scale={Math.min(1, 4.6 / n)}
        />
      ))}
    </>
  );
}

interface AvatarRowProps {
  members: MemberId[];
  /** Muestra la fila de nametags alineada bajo los avatares. */
  showNames?: boolean;
  className?: string;
}

/** Fila de avatares 3D en un único Canvas + nametags HTML alineados. */
export function AvatarRow({ members, showNames = true, className = '' }: AvatarRowProps) {
  return (
    <div className={`avatar-row ${className}`}>
      <RetroCanvas
        className="avatar-row__canvas"
        camera={{ position: [0, 0.35, 6.4], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <RowShapes members={members} />
      </RetroCanvas>
      {showNames && (
        <div className="avatar-row__names" style={{ gridTemplateColumns: `repeat(${members.length}, 1fr)` }}>
          {members.map((id) => (
            <span key={id} className="avatar-row__name" style={{ background: MEMBERS[id].color }}>
              {MEMBERS[id].nombre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Alto aproximado del busto a escala 1 en unidades de mundo (medida empírica
// contra screenshot: con 2.6 los bustos salían ~60% más grandes que su celda).
const BUST_WORLD_HEIGHT = 3.8;
// El centro visual del busto queda ~0.35 por encima del origen del group
// (por eso AvatarRow/AvatarBust suben la cámara ese offset).
const BUST_CENTER_Y = 0.35;

function ColumnShapes({
  members,
  rowHeight,
  avatarCenter,
  avatarSize,
}: {
  members: MemberId[];
  rowHeight: number;
  avatarCenter: number;
  avatarSize: number;
}) {
  // size.height = px reales del canvas (offsetSize) → px/unidad de mundo.
  // Así cada busto cae EXACTO sobre la celda placeholder de su fila HTML.
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  const pxToWorld = viewport.height / size.height;
  const scale = (avatarSize * pxToWorld) / BUST_WORLD_HEIGHT;
  return (
    <>
      {members.map((id, i) => {
        const centerPx = i * rowHeight + avatarCenter;
        const y = viewport.height / 2 - centerPx * pxToWorld - BUST_CENTER_Y * scale;
        return <Avatar3D key={id} member={id} position={[0, y, 0]} bobOffset={i * 1.3} scale={scale} />;
      })}
    </>
  );
}

interface AvatarColumnProps {
  members: MemberId[];
  /** Alto fijo en px de cada fila HTML sobre la que cae un avatar. */
  rowHeight: number;
  /** Centro en px de la celda del avatar dentro de su fila. */
  avatarCenter: number;
  /** Alto en px de la celda del avatar (define la escala del busto). */
  avatarSize: number;
  className?: string;
}

/**
 * Columna de avatares 3D en un único Canvas, para superponer sobre filas HTML
 * de alto fijo (créditos del Outro). Misma regla dura que AvatarRow: UN solo
 * contexto WebGL, nunca N AvatarBust.
 */
export function AvatarColumn({ members, rowHeight, avatarCenter, avatarSize, className = '' }: AvatarColumnProps) {
  return (
    <RetroCanvas
      className={className}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <ColumnShapes members={members} rowHeight={rowHeight} avatarCenter={avatarCenter} avatarSize={avatarSize} />
    </RetroCanvas>
  );
}
