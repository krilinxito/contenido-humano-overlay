import type { CSSProperties, ReactNode } from 'react';
import { MEMBERS, type MemberId } from '../../config/members';

// Caritas MS Paint de la plebe: SVG inline, trazos gruesos redondeados y
// temblorosos (mismo lenguaje que Doodles.tsx). Piel/pelo salen de
// config/members.ts; el resto son tokens CSS. El dibujo es espejo de
// branding/src/caritas.svg (el arte de marca) — si se retoca una cara,
// retocar ambos. SIN filtros acá adentro: `.sticker`/wobble los aplica el
// consumidor en una capa que cumpla las reglas de rendimiento
// (DESIGN_SYSTEM.md → Filtros y rendimiento).

interface CaritaProps {
  member: MemberId;
  /** Ancho en px (el alto sale del aspect 120:140). */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const INK = 'var(--crt-black)';

function CaraAym(): ReactNode {
  const { skin, hair } = MEMBERS.aym;
  return (
    <>
      {/* cabeza ovalada */}
      <path
        d="M60 14 Q 98 16, 100 62 Q 102 108, 62 122 Q 22 110, 21 63 Q 20 18, 60 14 Z"
        fill={skin} stroke={INK} strokeWidth="5" strokeLinejoin="round"
      />
      {/* pelo corto */}
      <path
        d="M22 52 Q 18 16, 60 12 Q 100 14, 99 50 Q 92 34, 78 36 Q 80 26, 66 30 Q 56 22, 48 34 Q 34 30, 22 52 Z"
        fill={hair} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      <circle cx="45" cy="64" r="5" fill={INK} />
      <circle cx="78" cy="63" r="5" fill={INK} />
      {/* nariz ANCHA */}
      <path
        d="M46 84 Q 50 92, 61 91 Q 73 92, 77 83 M 46 84 Q 52 78, 56 82 M 77 83 Q 71 77, 67 81"
        fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round"
      />
      <path d="M46 104 Q 61 113, 78 102" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function CaraDarbolis(): ReactNode {
  const { skin, hair } = MEMBERS.darbolis;
  return (
    <>
      {/* cabeza flaca/alargada */}
      <path
        d="M60 12 Q 90 14, 91 60 Q 92 112, 61 126 Q 30 114, 29 61 Q 28 16, 60 12 Z"
        fill={skin} stroke={INK} strokeWidth="5" strokeLinejoin="round"
      />
      {/* cerquillo PARTIDO al medio */}
      <path
        d="M30 56 Q 26 14, 60 11 Q 94 13, 90 54 Q 85 32, 64 42 L 62 24 L 58 42 Q 36 32, 30 56 Z"
        fill={hair} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      {/* lentes rectangulares */}
      <rect x="34" y="56" width="22" height="17" rx="3" fill="none" stroke={INK} strokeWidth="4" />
      <rect x="64" y="55" width="22" height="17" rx="3" fill="none" stroke={INK} strokeWidth="4" />
      <path d="M56 64 L 64 63" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="45" cy="65" r="3.5" fill={INK} />
      <circle cx="75" cy="64" r="3.5" fill={INK} />
      <path d="M60 74 Q 57 86, 63 89" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      {/* sonrisita ladeada (giggity) */}
      <path d="M46 105 Q 62 112, 78 100 Q 72 106, 66 105" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      {/* granos */}
      <circle cx="36" cy="88" r="3" fill="var(--y2k-red)" />
      <circle cx="84" cy="84" r="3" fill="var(--y2k-red)" />
      <circle cx="80" cy="95" r="2.4" fill="var(--y2k-red)" />
      <circle cx="40" cy="45" r="2.4" fill="var(--y2k-red)" />
    </>
  );
}

function CaraMots(): ReactNode {
  const { skin, hair } = MEMBERS.mots;
  return (
    <>
      <path
        d="M60 13 Q 97 15, 98 60 Q 99 108, 60 123 Q 21 109, 22 61 Q 23 17, 60 13 Z"
        fill={skin} stroke={INK} strokeWidth="5" strokeLinejoin="round"
      />
      {/* cerquillo recto con flequitos */}
      <path
        d="M23 58 Q 19 15, 60 12 Q 101 15, 97 57 L 90 44 L 82 52 L 73 43 L 63 52 L 53 43 L 44 52 L 34 44 L 23 58 Z"
        fill={hair} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      {/* ojos serenos (el único normal) */}
      <path d="M40 66 L 52 66 M 70 65 L 82 65" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="46" cy="69" r="4" fill={INK} />
      <circle cx="76" cy="68" r="4" fill={INK} />
      <path d="M60 76 Q 56 88, 64 90" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M48 105 Q 61 109, 75 104" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function CaraKrilin(): ReactNode {
  const { skin, hair } = MEMBERS.krilin;
  return (
    <>
      {/* melena larga detrás (hasta abajo) */}
      <path
        d="M60 8 Q 104 12, 103 58 Q 106 96, 98 132 L 84 124 L 88 134 L 74 128 Q 62 136, 46 128 L 32 134 L 36 123 L 22 132 Q 14 94, 17 56 Q 16 12, 60 8 Z"
        fill={hair} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      <path
        d="M60 24 Q 90 26, 90 62 Q 90 102, 60 114 Q 30 100, 30 63 Q 30 28, 60 24 Z"
        fill={skin} stroke={INK} strokeWidth="5" strokeLinejoin="round"
      />
      {/* raya del pelo al medio sobre la frente */}
      <path
        d="M31 58 Q 28 26, 60 23 Q 92 26, 89 57 Q 84 36, 63 44 L 61 30 L 57 44 Q 38 38, 31 58 Z"
        fill={hair} stroke={INK} strokeWidth="3" strokeLinejoin="round"
      />
      {/* ojos (picado, cejas bajas) */}
      <path d="M39 60 L 52 63 M 82 59 L 69 62" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="46" cy="69" r="4.5" fill={INK} />
      <circle cx="74" cy="68" r="4.5" fill={INK} />
      {/* nariz GRANDE y puntiaguda */}
      <path d="M61 66 L 47 96 L 63 93" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* boca de estar explicando algo */}
      <path d="M47 104 Q 58 110, 74 103 M 74 103 L 78 99" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function CaraChavez(): ReactNode {
  const { skin, hair } = MEMBERS.chavez;
  return (
    <>
      {/* cabeza cuadrada y ancha */}
      <path
        d="M18 26 Q 16 14, 30 15 L 90 14 Q 104 12, 103 28 L 104 100 Q 106 116, 90 116 L 32 118 Q 16 120, 17 104 Z"
        fill={skin} stroke={INK} strokeWidth="5" strokeLinejoin="round"
      />
      {/* pelo casquito */}
      <path
        d="M18 40 Q 16 12, 34 15 L 88 13 Q 105 11, 103 38 Q 92 28, 78 32 Q 70 24, 58 30 Q 42 24, 34 34 Q 26 32, 18 40 Z"
        fill={hair} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      {/* cachetes */}
      <circle cx="32" cy="86" r="7" fill="var(--y2k-magenta)" opacity="0.4" />
      <circle cx="90" cy="84" r="7" fill="var(--y2k-magenta)" opacity="0.4" />
      {/* lentes redondos */}
      <circle cx="43" cy="60" r="13" fill="none" stroke={INK} strokeWidth="4.5" />
      <circle cx="77" cy="59" r="13" fill="none" stroke={INK} strokeWidth="4.5" />
      <path d="M56 60 Q 60 57, 64 59 M 30 58 L 19 54 M 90 57 L 102 53" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {/* ojos cerrados de risa */}
      <path d="M37 60 Q 43 55, 49 60 M 71 59 Q 77 54, 83 59" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M60 68 Q 57 78, 62 80" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      {/* boca ABIERTA cagado de risa */}
      <path
        d="M42 92 Q 60 90, 80 91 Q 78 108, 60 109 Q 44 108, 42 92 Z"
        fill={INK} stroke={INK} strokeWidth="4" strokeLinejoin="round"
      />
      <path d="M47 93 Q 60 96, 75 93 L 74 97 Q 60 99, 48 97 Z" fill="var(--bg-cloud-white)" />
    </>
  );
}

const CARITAS: Record<MemberId, () => ReactNode> = {
  aym: CaraAym,
  darbolis: CaraDarbolis,
  mots: CaraMots,
  krilin: CaraKrilin,
  chavez: CaraChavez,
};

/** Carita Paint de un miembro (2D, barata — no gasta contexto WebGL). */
export function Carita({ member, size = 64, className = '', style }: CaritaProps) {
  const Cara = CARITAS[member];
  return (
    <svg
      width={size}
      height={(size * 140) / 120}
      viewBox="0 0 120 140"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <Cara />
    </svg>
  );
}
