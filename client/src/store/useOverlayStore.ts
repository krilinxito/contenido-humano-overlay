import { create } from 'zustand';
import { MEMBERS, MEMBER_IDS, type MemberId } from '../config/members';

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

/** Sapo CON texto (anuncio de donación desde el panel): dura más para que
 *  se llegue a leer. Ver docs/EVENTS.md, evento `gag`. */
export const SAPO_TEXT_DURATION_MS = 6000;

/**
 * Timings de la cortinilla de transición (LayoutCurtain): la cortina tapa
 * la pantalla ANTES de conmutar el layout (así el swap de agujeros magenta y
 * el salto seco de las fuentes de OBS pasan fuera de cámara) y se abre cuando
 * el reporter ya re-midió (~300ms de polling + margen).
 */
export const CURTAIN_IN_MS = 280;
export const CURTAIN_HOLD_MS = 500;

// ---- Paletas (evento `set-palette`, overrides en styles/themes.css) ----

/**
 * Re-tematizado en vivo: OverlayApp aplica `data-palette` en <html> y los
 * tokens CSS se overridean (themes.css). 'default' = tokens tal cual.
 * Límite: los colores que viven en JS (acentos de members.ts, materiales
 * 3D) NO cambian con la paleta. Ver docs/DESIGN_SYSTEM.md, "Paletas".
 */
export type PaletteId = 'default' | 'vaporwave' | 'xp-luna' | 'crt';

export const PALETTES: { id: PaletteId; label: string }[] = [
  { id: 'default', label: 'CH clásica' },
  { id: 'vaporwave', label: 'Vaporwave' },
  { id: 'xp-luna', label: 'XP Luna' },
  { id: 'crt', label: 'CRT' },
];

// ---- Chat real de Kick (evento `chat-message`, nace en server/kick.js) ----

export interface ChatMessage {
  user: string;
  msg: string;
  /** Color de nick que trae la identidad de Kick (hex); opcional. */
  color?: string;
}

/** Cuántos mensajes reales se retienen (FakeChat muestra los que entran). */
export const CHAT_BUFFER_SIZE = 15;

// ---- Memes (imagen/video mostrados desde el panel, evento `media`) ----

export type MediaPosition = 'center' | 'tl' | 'tr' | 'bl' | 'br';

export interface MediaState {
  url: string;
  kind: 'image' | 'video';
  /** Ancho como fracción del viewport (0.1..1). */
  scale: number;
  /** Opacidad 0..1 — ojo: <1 sobre un agujero magenta se keyea a medias. */
  opacity: number;
  /** Volumen 0..1 (solo video). */
  volume: number;
  position: MediaPosition;
}

export const DEFAULT_MEDIA: Omit<MediaState, 'url' | 'kind'> = {
  scale: 0.4,
  opacity: 1,
  volume: 0.8,
  position: 'center',
};

/**
 * Textos en pantalla editables por el productor desde el panel (`set-text`).
 * Regla: todo texto visible EN EL STREAM que pueda querer cambiarse en vivo
 * va acá, nunca hardcodeado en el layout (ver docs/COMPONENT_PATTERNS.md).
 * Quedan afuera: labels de placeholders (en stream los tapa la cam real) y
 * utilería fija de chiste (personas del TalkshowGrid, créditos extra del
 * Outro) — cambiarlas es tocar código, no operar el programa.
 */
export type TextKey =
  // generales
  | 'tema'
  | 'eslogan'
  | 'window-chat'
  | 'window-set'
  | 'window-plano-general'
  | 'plano360-label'
  // noticiero
  | 'zocalo'
  | 'ticker'
  | 'noticiero-tag'
  // intro / brb / outro
  | 'intro-marquee'
  | 'brb-title'
  | 'brb-sub'
  | 'outro-titulo'
  | 'outro-sub'
  | 'outro-gracias'
  | 'outro-marquee'
  // tema / lección / ppt
  | 'tema-label'
  | 'tema-window'
  | 'leccion-label'
  | 'ppt-window'
  | 'ppt-timer-label'
  // tertulia / debate / papeado / penitencia
  | 'tertulia-pick'
  | 'debate-banner'
  | 'debate-vs'
  | 'papeado-titulo'
  | 'papeado-redoble'
  | 'papeado-sello'
  | 'papeado-label'
  | 'penitencia'
  | 'penitencia-pick'
  | 'penitencia-label'
  | 'penitencia-testigos'
  // nombres de miembros (nametags, badges, títulos de ventana derivados)
  | `nombre-${MemberId}`;

const DEFAULT_MEMBER_NAMES = Object.fromEntries(
  MEMBER_IDS.map((id) => [`nombre-${id}`, MEMBERS[id].nombre]),
) as Record<`nombre-${MemberId}`, string>;

export const DEFAULT_TEXTS: Record<TextKey, string> = {
  tema: '¿DE QUÉ VAMOS A HABLAR?',
  eslogan: 'En la era de la inteligencia artificial abraza la estupidez humana',
  'window-chat': 'chat_en_vivo.exe',
  'window-set': 'vista_del_set.avi',
  'window-plano-general': 'plano_general_FINAL_v2 (2).mov',
  'plano360-label': '⟳ CÁMARA MAREADA ⟳',
  zocalo: 'ESTÁ PASANDO ALGO (NO SABEMOS QUÉ)',
  ticker:
    'ÚLTIMO MOMENTO ★ UN HOMBRE ASEGURA HABER VISTO CONTENIDO ★ EL DÓLAR COTIZA EN SENTIMIENTOS ★ ' +
    'CIENTÍFICOS CONFIRMAN: EL SAPO ES REAL ★ MAÑANA PODRÍA LLOVER O NO, NADIE SABE ★ ',
  'noticiero-tag': 'EN VIVO',
  'intro-marquee': 'YA EMPIEZA ★ CONTENIDO HUMANO ★ AGARRATE ★ YA EMPIEZA ★ CONTENIDO HUMANO ★ AGARRATE ★ ',
  'brb-title': 'YA VOLVEMOS',
  'brb-sub': '(fuimos a buscar más contenido humano)',
  'outro-titulo': 'ESO FUE TODO',
  'outro-sub': '(sí, en serio)',
  'outro-gracias': 'GRACIAS POR NADA ♥',
  'outro-marquee': 'CHAU ★ NOS VEMOS LA PRÓXIMA ★ O NO ★ APAGÁ EL STREAM ★ DALE ★ CHAU ★ ',
  'tema-label': 'EL TEMA DE HOY:',
  'tema-window': 'tema_de_hoy_v4_AHORA_SI.mp4',
  'leccion-label': 'LECCIÓN DE HOY',
  'ppt-window': 'presentacion_final_v3_DEFINITIVA(1).ppt — PowerPoint',
  'ppt-timer-label': 'TIEMPO RESTANTE',
  'tertulia-pick': '¿QUIÉN EMPIEZA?',
  'debate-banner': 'QUE EMPIECE EL DEBATE',
  'debate-vs': 'VS',
  'papeado-titulo': 'EL MÁS PAPEADO DEL DÍA',
  'papeado-redoble': '🥁 REDOBLE... 🥁',
  'papeado-sello': 'PAPEADO',
  'papeado-label': 'SU PENITENCIA:',
  penitencia: '',
  'penitencia-pick': '¿QUIÉN PAGA?',
  'penitencia-label': 'CUMPLIENDO:',
  'penitencia-testigos': 'la plebe reacciona',
  ...DEFAULT_MEMBER_NAMES,
};

/**
 * Nombre en pantalla de un miembro: el editable del panel (`nombre-<id>`),
 * con fallback al de `config/members.ts`. Usarlo en TODO lugar que muestre
 * el nombre (nametags, badges, títulos de ventana derivados, créditos).
 */
export function getMemberName(texts: Record<TextKey, string>, id: MemberId): string {
  return texts[`nombre-${id}`] || MEMBERS[id].nombre;
}

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
  /** Cortinilla de transición visible (tapa el cambio de layout). */
  curtain: boolean;
  activeGag: GagId | null;
  /** Texto dictado para el gag (sapo anunciador de donaciones); null = el
   *  gag usa su contenido random de siempre. */
  gagText: string | null;
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
  /** Meme (imagen/video) en pantalla; null = nada. */
  media: MediaState | null;
  /** Paleta activa (overrides de tokens en themes.css). */
  palette: PaletteId;
  /** Últimos mensajes reales del chat de Kick; vacío = nunca llegó nada
   *  (FakeChat cae a sus mensajes falsos — dev sin config se ve igual). */
  chatMessages: ChatMessage[];
  /** Chat flotante sobre el overlay (botón CHAT del panel, evento `chat-overlay`). */
  chatOverlay: boolean;
  /** Track del jukebox sonando (id de MUSIC_TRACKS); null = silencio. */
  musicTrack: string | null;
  /** Volumen de la música 0..1 (los SFX van siempre a full). */
  musicVolume: number;
  setLayout: (layout: LayoutId) => void;
  /** Cambio de layout CON cortinilla (lo usa `set-layout` por socket). */
  requestLayout: (layout: LayoutId) => void;
  triggerGag: (gag: GagId, text?: string) => void;
  clearGag: () => void;
  setActiveMember: (member: MemberId | null) => void;
  setPhase: (phase: PhaseId | null) => void;
  startTimer: (durationMs: number) => void;
  stopTimer: () => void;
  setText: (key: TextKey, text: string) => void;
  setBumIndex: (index: number) => void;
  showMedia: (media: MediaState) => void;
  updateMedia: (patch: Partial<Omit<MediaState, 'url' | 'kind'>>) => void;
  hideMedia: () => void;
  setPalette: (palette: PaletteId) => void;
  pushChatMessage: (message: ChatMessage) => void;
  setChatOverlay: (visible: boolean) => void;
  setMusic: (track: string | null) => void;
  setMusicVolume: (volume: number) => void;
}

let gagTimer: ReturnType<typeof setTimeout> | undefined;
let curtainSwapTimer: ReturnType<typeof setTimeout> | undefined;
let curtainOpenTimer: ReturnType<typeof setTimeout> | undefined;

export const useOverlayStore = create<OverlayState>((set, get) => ({
  layout: initialLayoutFromUrl(),
  curtain: false,
  activeGag: null,
  gagText: null,
  activeMember: null,
  phase: null,
  timerEndsAt: null,
  texts: { ...DEFAULT_TEXTS },
  bumIndex: 1,
  media: null,
  palette: 'default',
  chatMessages: [],
  chatOverlay: false,
  musicTrack: null,
  musicVolume: 0.5,

  setLayout: (layout) => set({ layout }),

  // Secuencia de la cortinilla: cerrar → conmutar layout tapado → abrir.
  // Un pedido nuevo a mitad de secuencia resetea los timers (la cortina
  // sigue cerrada y el layout final es el último pedido). Mismo layout = no-op.
  requestLayout: (layout) => {
    if (get().layout === layout && !curtainSwapTimer) return;
    clearTimeout(curtainSwapTimer);
    clearTimeout(curtainOpenTimer);
    set({ curtain: true });
    curtainSwapTimer = setTimeout(() => {
      curtainSwapTimer = undefined;
      set({ layout });
    }, CURTAIN_IN_MS);
    curtainOpenTimer = setTimeout(() => {
      curtainOpenTimer = undefined;
      set({ curtain: false });
    }, CURTAIN_IN_MS + CURTAIN_HOLD_MS);
  },

  // Un gag nuevo pisa al anterior y resetea el timer de auto-limpieza.
  // Con `text` (sapo anunciador de donaciones) el gag lo dice en vez de su
  // contenido random y dura más (SAPO_TEXT_DURATION_MS).
  triggerGag: (gag, text) => {
    clearTimeout(gagTimer);
    set({ activeGag: gag, gagText: text ?? null });
    const duration = text ? SAPO_TEXT_DURATION_MS : GAG_DURATIONS_MS[gag];
    gagTimer = setTimeout(() => set({ activeGag: null, gagText: null }), duration);
  },

  clearGag: () => {
    clearTimeout(gagTimer);
    set({ activeGag: null, gagText: null });
  },

  setActiveMember: (member) => set({ activeMember: member }),

  setPhase: (phase) => set({ phase }),

  startTimer: (durationMs) => set({ timerEndsAt: Date.now() + durationMs }),

  stopTimer: () => set({ timerEndsAt: null }),

  setText: (key, text) => set((s) => ({ texts: { ...s.texts, [key]: text } })),

  setBumIndex: (index) => set({ bumIndex: Math.min(5, Math.max(1, Math.round(index))) }),

  showMedia: (media) => set({ media }),

  // Ajustes en vivo (sliders del panel); sin media visible es un no-op.
  updateMedia: (patch) => set((s) => (s.media ? { media: { ...s.media, ...patch } } : {})),

  hideMedia: () => set({ media: null }),

  setPalette: (palette) => set({ palette }),

  pushChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages, message].slice(-CHAT_BUFFER_SIZE) })),

  setChatOverlay: (visible) => set({ chatOverlay: visible }),

  setMusic: (track) => set({ musicTrack: track }),

  setMusicVolume: (volume) => set({ musicVolume: Math.min(1, Math.max(0, volume)) }),
}));
