import './ScreenPlaceholder.css';

interface ScreenPlaceholderProps {
  label: string;
  className?: string;
}

/**
 * Placeholder para pantallas compartidas (screen share del profe, PPT,
 * visuales del tema). Igual que CamPlaceholder: acá va la captura real
 * después, sin tocar la composición del layout.
 */
export function ScreenPlaceholder({ label, className = '' }: ScreenPlaceholderProps) {
  return (
    <div className={`screen-placeholder ${className}`}>
      <span className="screen-placeholder__icon">🖥️</span>
      <span className="screen-placeholder__label chroma-text">{label}</span>
      <span className="screen-placeholder__hint">compartiendo pantalla…</span>
    </div>
  );
}
