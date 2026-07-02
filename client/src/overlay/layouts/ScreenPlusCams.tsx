import type { ReactNode } from 'react';
import { MEMBER_IDS, type MemberId } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { ScreenPlaceholder } from '../chrome/ScreenPlaceholder';
import { CamCell } from '../chrome/CamCell';
import './ScreenPlusCams.css';

interface ScreenPlusCamsProps {
  /** Label de la pantalla compartida (ej. "MOTS SCREEN"). */
  screenLabel: string;
  /** Título de la ventana XP de la pantalla. */
  windowTitle: string;
  /** Miembro resaltado en el strip de cams (borde de su color). */
  highlight?: MemberId | null;
  /** Contenido extra sobre la pantalla (títulos, timer, doodles). */
  children?: ReactNode;
}

/**
 * Composición interna reusable (NO se registra como layout): pantalla grande
 * + strip vertical con las 5 cams de la plebe (CamCell). La usan Lección,
 * Tema y CamsPantalla. Ver docs/COMPONENT_PATTERNS.md.
 */
export function ScreenPlusCams({ screenLabel, windowTitle, highlight = null, children }: ScreenPlusCamsProps) {
  return (
    <div className="screen-plus-cams">
      <div className="screen-plus-cams__screen">
        <XPWindow title={windowTitle} className="screen-plus-cams__window">
          <ScreenPlaceholder label={screenLabel} />
          {children}
        </XPWindow>
      </div>
      <div className="screen-plus-cams__strip">
        {MEMBER_IDS.map((id) => (
          <CamCell key={id} member={id} highlight={highlight === id} className="screen-plus-cams__cell" />
        ))}
      </div>
    </div>
  );
}
