import { create } from 'zustand';
import type { MemberId } from '../config/members';

// La integración con OBS (obs-websocket) vive en server/obs.js, NO acá: el
// overlay solo reporta los rects de sus agujeros de cámara en modo ?cams=real
// (overlay/camRectReporter.ts) y el server mueve las fuentes reales.
// Ver docs/ARCHITECTURE.md, "Cámaras reales".

export type LayoutId =
  | 'talkshow-grid'
  | 'plano-general'
  | 'noticiero'
  | 'brb-bizarro'
  | 'intro'
  | 'tertulia'
  | 'leccion'
  | 'ppt'
  | 'tema'
  | 'debate'
  | 'papeado'
  | 'bum-horizontal'
  | 'bum-vertical'
  | 'penitencia'
  | 'outro'
  | 'plano-360'
  | 'cams-pantalla';

export type GagId = 'glitch-interrupt' | 'alerta-falsa' | 'sapo-random';

/** Fases del rundown del programa (banner superior, ver PhaseBanner). */
export type PhaseId =
  | 'tertulia'
  | 'tema'
  | 'leccion'
  | 'hot-topics'
  | 'debate'
  | 'perdedor'
  | 'juego'
  | 'bum';

/** Duración de cada gag antes de auto-limpiarse (ver docs/EVENTS.md). */
export const GAG_DURATIONS_MS: Record<GagId, number> = {
  'glitch-interrupt': 1600,
  'alerta-falsa': 3200,
  'sapo-random': 4000,
};

/**
 * Textos en pantalla editables por el productor desde el panel (`set-text`).
 * Regla: todo texto visible que pueda querer cambiarse en vivo va acá,
 * nunca hardcodeado en el layout (ver docs/COMPONENT_PATTERNS.md).
 */
export type TextKey = 'tema' | 'zocalo' | 'ticker' | 'penitencia' | 'intro-marquee' | 'brb-sub';

export const DEFAULT_TEXTS: Record<TextKey, string> = {
  tema: '¿DE QUÉ VAMOS A HABLAR?',
  zocalo: 'ESTÁ PASANDO ALGO (NO SABEMOS QUÉ)',
  ticker:
    'ÚLTIMO MOMENTO ★ UN HOMBRE ASEGURA HABER VISTO CONTENIDO ★ EL DÓLAR COTIZA EN SENTIMIENTOS ★ ' +
    'CIENTÍFICOS CONFIRMAN: EL SAPO ES REAL ★ MAÑANA PODRÍA LLOVER O NO, NADIE SABE ★ ',
  penitencia: '',
  'intro-marquee': 'YA EMPIEZA ★ CONTENIDO HUMANO ★ AGARRATE ★ YA EMPIEZA ★ CONTENIDO HUMANO ★ AGARRATE ★ ',
  'brb-sub': '(fuimos a buscar más contenido humano)',
};

const ALL_LAYOUTS: LayoutId[] = [
  'talkshow-grid',
  'plano-general',
  'noticiero',
  'brb-bizarro',
  'intro',
  'tertulia',
  'leccion',
  'ppt',
  'tema',
  'debate',
  'papeado',
  'bum-horizontal',
  'bum-vertical',
  'penitencia',
  'outro',
  'plano-360',
  'cams-pantalla',
];

/**
 * Modo híbrido OBS (ver docs/ARCHITECTURE.md): cada escena de OBS puede
 * cargar el overlay con `/?layout=<id>` como layout inicial. Se lee UNA vez
 * al arrancar; no hay navegación. El cambio por socket sigue funcionando.
 */
function initialLayoutFromUrl(): LayoutId {
  const param = new URLSearchParams(window.location.search).get('layout');
  return ALL_LAYOUTS.includes(param as LayoutId) ? (param as LayoutId) : 'talkshow-grid';
}

interface OverlayState {
  layout: LayoutId;
  activeGag: GagId | null;
  /** Miembro protagonista (tertulia, lección, ppt...). */
  activeMember: MemberId | null;
  /** Fase actual del programa; null = banner oculto. */
  phase: PhaseId | null;
  /** Timestamp (ms epoch) en que termina el countdown; null = sin timer. */
  timerEndsAt: number | null;
  /** Textos en pantalla editables desde el panel. */
  texts: Record<TextKey, string>;
  /** Cuál de los 5 reels/videos del miembro va en los BUM (1..5). */
  bumIndex: number;
  /** Track del jukebox sonando (id de MUSIC_TRACKS); null = silencio. */
  musicTrack: string | null;
  /** Volumen de la música 0..1 (los SFX van siempre a full). */
  musicVolume: number;
  setLayout: (layout: LayoutId) => void;
  triggerGag: (gag: GagId) => void;
  clearGag: () => void;
  setActiveMember: (member: MemberId | null) => void;
  setPhase: (phase: PhaseId | null) => void;
  startTimer: (durationMs: number) => void;
  stopTimer: () => void;
  setText: (key: TextKey, text: string) => void;
  setBumIndex: (index: number) => void;
  setMusic: (track: string | null) => void;
  setMusicVolume: (volume: number) => void;
}

let gagTimer: ReturnType<typeof setTimeout> | undefined;

export const useOverlayStore = create<OverlayState>((set) => ({
  layout: initialLayoutFromUrl(),
  activeGag: null,
  activeMember: null,
  phase: null,
  timerEndsAt: null,
  texts: { ...DEFAULT_TEXTS },
  bumIndex: 1,
  musicTrack: null,
  musicVolume: 0.5,

  setLayout: (layout) => set({ layout }),

  // Un gag nuevo pisa al anterior y resetea el timer de auto-limpieza.
  triggerGag: (gag) => {
    clearTimeout(gagTimer);
    set({ activeGag: gag });
    gagTimer = setTimeout(() => set({ activeGag: null }), GAG_DURATIONS_MS[gag]);
  },

  clearGag: () => {
    clearTimeout(gagTimer);
    set({ activeGag: null });
  },

  setActiveMember: (member) => set({ activeMember: member }),

  setPhase: (phase) => set({ phase }),

  startTimer: (durationMs) => set({ timerEndsAt: Date.now() + durationMs }),

  stopTimer: () => set({ timerEndsAt: null }),

  setText: (key, text) => set((s) => ({ texts: { ...s.texts, [key]: text } })),

  setBumIndex: (index) => set({ bumIndex: Math.min(5, Math.max(1, Math.round(index))) }),

  setMusic: (track) => set({ musicTrack: track }),

  setMusicVolume: (volume) => set({ musicVolume: Math.min(1, Math.max(0, volume)) }),
}));
