import { io, type Socket } from 'socket.io-client';
import {
  useOverlayStore,
  DEFAULT_MEDIA,
  type GagId,
  type LayoutId,
  type PhaseId,
  type TextKey,
  type MediaPosition,
  type PaletteId,
} from './store/useOverlayStore';
import type { MemberId } from './config/members';
import type { HoleId } from './config/cams';
import { playSfx } from './overlay/audio';
import { SFX_SOUNDS } from './config/sounds';

/** Duración default del countdown de hot topics: 5 minutos. */
export const DEFAULT_TIMER_MS = 5 * 60 * 1000;

// Contrato de eventos compartido entre panel y overlay (ver docs/EVENTS.md).
export type TriggerEvent =
  | { type: 'set-layout'; layout: LayoutId }
  | { type: 'gag'; gag: GagId; text?: string } // text: el sapo lo dice (donaciones) y dura más
  | { type: 'set-member'; member: MemberId | null }
  | { type: 'set-phase'; phase: PhaseId | null }
  | { type: 'timer'; action: 'start' | 'stop'; durationMs?: number }
  | { type: 'set-text'; key: TextKey; text: string }
  | { type: 'set-bum-index'; index: number }
  | { type: 'sfx'; id: string }
  | { type: 'music'; action: 'play' | 'stop'; track?: string }
  | { type: 'music-volume'; volume: number }
  | {
      type: 'media';
      action: 'show' | 'update' | 'hide';
      url?: string; // requerido en show (relativa al server, ej. /media/x.mp4, o absoluta)
      kind?: 'image' | 'video'; // requerido en show
      scale?: number; // 0.1..1 (fracción del ancho del viewport)
      opacity?: number; // 0..1
      volume?: number; // 0..1, solo video
      position?: MediaPosition;
    }
  | { type: 'set-palette'; palette: PaletteId }
  // Chat de Kick flotante sobre el overlay (botón CHAT del panel).
  | { type: 'chat-overlay'; visible: boolean }
  // Eventos que NACEN en el server (server/kick.js, integración Kick);
  // el panel nunca los emite. Llegan igual que todo, por `overlay-event`.
  | { type: 'chat-message'; user: string; msg: string; color?: string }
  | { type: 'follow'; user?: string };

/** Rect de una ventana de cámara o pantalla, normalizado 0..1 sobre el viewport del overlay. */
export interface CamRect {
  cam: HoleId;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Payload de `cam-rects` (Overlay → Server, solo en modo `?cams=real`). */
export interface CamRectsPayload {
  layout: LayoutId;
  rects: CamRect[];
}

/** URL del server (socket + uploads de memes; la usa también el panel para fetch). */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

/** Resuelve una URL de media relativa al server (los /media/* viven en :3001). */
export function resolveMediaUrl(url: string): string {
  return url.startsWith('http') || url.startsWith('data:') ? url : SOCKET_URL + url;
}

let socket: Socket | undefined;

export function getSocket(): Socket {
  socket ??= io(SOCKET_URL);
  return socket;
}

/** Lo usa el panel para disparar eventos. */
export function emitTrigger(event: TriggerEvent) {
  getSocket().emit('trigger', event);
}

/**
 * Lo usa el reporter de ventanas de cámara (overlay/camRectReporter.ts).
 * El server NO lo re-emite: lo traduce a transforms de OBS (server/obs.js).
 */
export function emitCamRects(payload: CamRectsPayload) {
  getSocket().emit('cam-rects', payload);
}

/**
 * Lo llama OverlayApp una sola vez: escucha `overlay-event` del server
 * y despacha al store. Devuelve un cleanup para desuscribirse.
 */
export function bindOverlaySocket(): () => void {
  const s = getSocket();
  const onOverlayEvent = (event: TriggerEvent) => {
    const {
      requestLayout,
      triggerGag,
      setActiveMember,
      setPhase,
      startTimer,
      stopTimer,
      setText,
      setBumIndex,
      setMusic,
      setMusicVolume,
      showMedia,
      updateMedia,
      hideMedia,
      setPalette,
      pushChatMessage,
      setChatOverlay,
    } = useOverlayStore.getState();
    switch (event.type) {
      // Con cortinilla: el swap del layout pasa tapado (ver LayoutCurtain).
      case 'set-layout':
        requestLayout(event.layout);
        break;
      case 'gag':
        triggerGag(event.gag, event.text);
        break;
      case 'set-member':
        setActiveMember(event.member);
        break;
      case 'set-phase':
        setPhase(event.phase);
        break;
      case 'timer':
        if (event.action === 'start') startTimer(event.durationMs ?? DEFAULT_TIMER_MS);
        else stopTimer();
        break;
      case 'set-text':
        setText(event.key, event.text);
        break;
      case 'set-bum-index':
        setBumIndex(event.index);
        break;
      // SFX: one-shot sin estado — no pasa por el store (ver docs/EVENTS.md).
      case 'sfx':
        playSfx(event.id);
        break;
      case 'music':
        setMusic(event.action === 'play' ? (event.track ?? null) : null);
        break;
      case 'music-volume':
        setMusicVolume(event.volume);
        break;
      case 'media':
        if (event.action === 'show' && event.url && event.kind) {
          showMedia({
            ...DEFAULT_MEDIA,
            url: event.url,
            kind: event.kind,
            ...(event.scale !== undefined && { scale: event.scale }),
            ...(event.opacity !== undefined && { opacity: event.opacity }),
            ...(event.volume !== undefined && { volume: event.volume }),
            ...(event.position !== undefined && { position: event.position }),
          });
        } else if (event.action === 'update') {
          updateMedia({
            ...(event.scale !== undefined && { scale: event.scale }),
            ...(event.opacity !== undefined && { opacity: event.opacity }),
            ...(event.volume !== undefined && { volume: event.volume }),
            ...(event.position !== undefined && { position: event.position }),
          });
        } else if (event.action === 'hide') {
          hideMedia();
        }
        break;
      case 'set-palette':
        setPalette(event.palette);
        break;
      case 'chat-message':
        pushChatMessage({ user: event.user, msg: event.msg, color: event.color });
        break;
      case 'chat-overlay':
        setChatOverlay(event.visible);
        break;
      // Follow de Kick: lo anuncia el sapo (mismo mecanismo que las
      // donaciones) + sfx `follow` si existe, con fallback a `celebrate`.
      case 'follow': {
        const nombre = event.user?.trim();
        triggerGag('sapo-random', nombre ? `¡${nombre} ahora sigue el canal!` : '¡nuevo seguidor en el canal!');
        const sfxId = ['follow', 'celebrate'].find((id) => SFX_SOUNDS.some((s) => s.id === id));
        if (sfxId) playSfx(sfxId);
        break;
      }
    }
  };
  s.on('overlay-event', onOverlayEvent);
  return () => {
    s.off('overlay-event', onOverlayEvent);
  };
}
