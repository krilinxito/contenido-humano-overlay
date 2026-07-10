// Config central de los 5 integrantes de la plebe.
// Todo lo que identifica a un miembro (nombre, adjetivos del badge, colores
// de su avatar) vive acá — ver docs/COMPONENT_PATTERNS.md.

export type MemberId = 'aym' | 'darbolis' | 'mots' | 'krilin' | 'chavez';

export interface Member {
  id: MemberId;
  nombre: string;
  /** Adjetivos chistosos rotables para el MemberBadge. */
  adjetivos: string[];
  /** Color de acento del miembro (hex de la paleta, sirve para CSS y Three). */
  color: string;
  /** Tono de piel del avatar (hex, espejo de --skin-* en tokens.css). */
  skin: string;
  /** Color de pelo del avatar. */
  hair: string;
}

// El ORDEN de las claves es el orden oficial del programa (define MEMBER_IDS:
// grillas, strips, panel y créditos lo heredan solo).
export const MEMBERS: Record<MemberId, Member> = {
  aym: {
    id: 'aym',
    nombre: 'AYM',
    adjetivos: [
      'Políticamente Correcto (no sabe de qué)',
      'Defensor de lo Correcto™',
      'Despistado con Causa',
      'El Abogado del Bien',
    ],
    color: '#3d7eff', // --xp-blue-bright (azul)
    skin: '#d99a6c', // --skin-tan
    hair: '#1c1c1c',
  },
  darbolis: {
    id: 'darbolis',
    nombre: 'DARBOLIS',
    adjetivos: [
      'Edgy Certificado',
      'Quagmire de Temu',
      'Giggity',
      'El Incomodador',
    ],
    color: '#7b2ff7', // --y2k-purple (morado)
    skin: '#f2c49b', // --skin-light
    hair: '#26150e',
  },
  mots: {
    id: 'mots',
    nombre: 'MOTS',
    adjetivos: [
      'El Único Normal',
      'Grounded desde 1999',
      'Voz de la Razón (a veces)',
      'El Más Cuerdo del Manicomio',
    ],
    color: '#ff2e2e', // --y2k-red (rojo)
    skin: '#9c6b43', // --skin-brown
    hair: '#141414',
  },
  krilin: {
    id: 'krilin',
    nombre: 'KRILIN',
    adjetivos: [
      'Brainroteado Sabiondo',
      'Ragebaiteable Nivel Dios',
      'Sabelotodo Picado',
      'Enciclopedia Rota',
    ],
    color: '#ff3ea5', // --y2k-magenta (rosado)
    skin: '#d99a6c', // --skin-tan
    hair: '#0d0d0d',
  },
  chavez: {
    id: 'chavez',
    nombre: 'CHAVEZ',
    adjetivos: [
      'El Rey Lich del Gym (nunca fue)',
      'Fantasma Profesional',
      'Moralista Intermitente',
      'Bugeado de Fábrica',
      'Se Ríe Cagado',
    ],
    color: '#b4f461', // --aero-lime (verde)
    skin: '#f2c49b', // --skin-light
    hair: '#3b2a1d',
  },
};

export const MEMBER_IDS = Object.keys(MEMBERS) as MemberId[];

/** Adjetivo random del pool de un miembro (uno por montaje del badge). */
export function randomAdjetivo(id: MemberId): string {
  const pool = MEMBERS[id].adjetivos;
  return pool[Math.floor(Math.random() * pool.length)];
}
