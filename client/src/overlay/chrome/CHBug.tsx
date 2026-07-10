import { useOverlayStore } from '../../store/useOverlayStore';
import './CHBug.css';

interface CHBugProps {
  /** Muestra el eslogan en marquee debajo del logo. */
  showSlogan?: boolean;
  className?: string;
}

/**
 * Bug del programa (logo CH). Montado SIEMPRE por OverlayApp, abajo a la
 * izquierda (para no tapar cámaras); en layouts con zócalo inferior se pasa
 * `ch-bug-wrap--top-right`. También reusable en tamaño XL (Intro).
 */
export function CHBug({ showSlogan = true, className = '' }: CHBugProps) {
  const eslogan = useOverlayStore((s) => s.texts.eslogan);
  return (
    <div className={`ch-bug-wrap ${className}`}>
      {/* El sway va en un wrapper aparte: animar transform en el mismo
          elemento que lleva filter: url(#wobble) re-rasteriza el filtro SVG
          en cada frame (regla en DESIGN_SYSTEM.md). */}
      <div className="ch-bug-sway">
        <div className="ch-bug wobble-border">
          <span className="ch-bug__ch">CH</span>
          <span className="ch-bug__text">contenido humano</span>
        </div>
      </div>
      {showSlogan && (
        <div className="ch-bug__slogan marquee">
          <span className="marquee-inner">{eslogan} ★ </span>
        </div>
      )}
    </div>
  );
}
