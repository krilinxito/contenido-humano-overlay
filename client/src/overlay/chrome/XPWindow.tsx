import type { ReactNode } from 'react';
import './XPWindow.css';

interface XPWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Ventana estilo Windows XP: barra de título con gradiente, botones falsos, cuerpo biselado. */
export function XPWindow({ title, children, className = '' }: XPWindowProps) {
  return (
    <div className={`xp-window bevel-out ${className}`}>
      <div className="xp-window__titlebar">
        <span className="xp-window__title">{title}</span>
        <span className="xp-window__buttons">
          <span className="xp-window__btn">_</span>
          <span className="xp-window__btn">□</span>
          <span className="xp-window__btn xp-window__btn--close">✕</span>
        </span>
      </div>
      <div className="xp-window__body">{children}</div>
    </div>
  );
}
