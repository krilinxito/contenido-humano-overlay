import type { CSSProperties } from 'react';

// Garabatos SVG estilo MS Paint / mano alzada: trazos gruesos, redondeados
// y temblorosos. Se usan como decoración suelta en layouts (posicionar con
// style/className desde el layout). Ver DESIGN_SYSTEM.md → Paint / mano alzada.

interface DoodleProps {
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function DoodleArrow({ color = 'var(--y2k-magenta)', size = 90, className = '', style }: DoodleProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className} style={style} aria-hidden="true">
      <path
        d="M4 32 Q 28 20, 48 30 T 84 28 M 70 12 Q 82 22, 88 28 Q 80 36, 66 46"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleStar({ color = 'var(--warning-yellow)', size = 70, className = '', style }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} style={style} aria-hidden="true">
      <path
        d="M40 6 L 47 30 L 74 31 L 52 46 L 61 73 L 39 56 L 18 71 L 26 45 L 6 29 L 32 29 Z"
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleSquiggle({ color = 'var(--aero-teal)', size = 120, className = '', style }: DoodleProps) {
  return (
    <svg width={size} height={size * 0.33} viewBox="0 0 120 40" className={className} style={style} aria-hidden="true">
      <path
        d="M4 22 Q 14 4, 24 20 T 44 18 T 64 24 T 84 16 T 112 22"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleCircle({ color = 'var(--xp-blue-bright)', size = 90, className = '', style }: DoodleProps) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" className={className} style={style} aria-hidden="true">
      <path
        d="M52 8 Q 88 4, 92 32 Q 94 60, 52 64 Q 12 68, 8 38 Q 5 12, 46 9 Q 70 7, 86 16"
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
