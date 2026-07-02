import { useEffect, useRef } from 'react';
import { CAMS_REAL, registerCamHole } from '../camRectReporter';
import type { CamId } from '../../config/cams';
import './CamPlaceholder.css';

interface CamPlaceholderProps {
  label: string;
  /** Elige el patrón de fondo distintivo (se cicla si hay más cams que patrones). */
  index?: number;
  /**
   * Cámara física que va acá. En modo `?cams=real` la celda se vuelve un
   * agujero color-key (la cámara real de OBS se ve a través); sin `cam`,
   * o fuera de ese modo, se muestra el patrón de siempre.
   */
  cam?: CamId;
  className?: string;
}

const PATTERNS = ['tarta', 'rombos', 'rayas', 'puntos', 'ondas'] as const;

/**
 * Placeholder de video de cámara. En modo cámaras reales (ver
 * docs/ARCHITECTURE.md) esto se pinta del magenta llave y reporta su rect
 * para que el server posicione la fuente de OBS detrás del overlay.
 */
export function CamPlaceholder({ label, index = 0, cam, className = '' }: CamPlaceholderProps) {
  const holeRef = useRef<HTMLDivElement>(null);
  const isHole = CAMS_REAL && cam !== undefined;

  useEffect(() => {
    if (!isHole || !holeRef.current || !cam) return;
    return registerCamHole(holeRef.current, cam);
  }, [isHole, cam]);

  if (isHole) {
    return (
      <div ref={holeRef} className={`cam-placeholder cam-placeholder--hole ${className}`}>
        <span className="cam-placeholder__rec blink-hard">● REC</span>
      </div>
    );
  }

  const pattern = PATTERNS[index % PATTERNS.length];
  return (
    <div className={`cam-placeholder cam-placeholder--${pattern} ${className}`}>
      <span className="cam-placeholder__label chroma-text">{label}</span>
      <span className="cam-placeholder__rec blink-hard">● REC</span>
    </div>
  );
}
