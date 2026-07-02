import { useEffect, useRef } from 'react';
import { CAMS_REAL, registerCamHole } from '../camRectReporter';
import type { ScreenId } from '../../config/cams';
import './ScreenPlaceholder.css';

interface ScreenPlaceholderProps {
  label: string;
  /**
   * Pantalla real que va acá. En modo `?cams=real` el área se vuelve un
   * agujero color-key (la captura NDI/ventana de OBS se ve a través); sin
   * `screen`, o fuera de ese modo, se muestra el placeholder decorativo.
   */
  screen?: ScreenId;
  className?: string;
}

/**
 * Placeholder para pantallas compartidas (screen share del profe, PPT,
 * visuales del tema). Mismo mecanismo de agujero que CamPlaceholder: en modo
 * cámaras reales se pinta del magenta llave y reporta su rect para que el
 * server posicione la fuente de OBS detrás (ver docs/ARCHITECTURE.md).
 */
export function ScreenPlaceholder({ label, screen, className = '' }: ScreenPlaceholderProps) {
  const holeRef = useRef<HTMLDivElement>(null);
  const isHole = CAMS_REAL && screen !== undefined;

  useEffect(() => {
    if (!isHole || !holeRef.current || !screen) return;
    return registerCamHole(holeRef.current, screen);
  }, [isHole, screen]);

  if (isHole) {
    return <div ref={holeRef} className={`screen-placeholder screen-placeholder--hole ${className}`} />;
  }

  return (
    <div className={`screen-placeholder ${className}`}>
      <span className="screen-placeholder__icon">🖥️</span>
      <span className="screen-placeholder__label chroma-text">{label}</span>
      <span className="screen-placeholder__hint">compartiendo pantalla…</span>
    </div>
  );
}
