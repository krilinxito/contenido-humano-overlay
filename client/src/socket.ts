import { io, type Socket } from 'socket.io-client';
import { useOverlayStore, type GagId, type LayoutId, type PhaseId, type TextKey } from './store/useOverlayStore';
import type { MemberId } from './config/members';
import type { HoleId } from './config/cams';
import { playSfx } from './overlay/audio';

/** Duración default del countdown de hot topics: 5 minutos. */
export const DEFAULT_TIMER_MS = 5 * 60 * 1000;

// Contrato de eventos compartido entre panel y overlay (ver docs/EVENTS.md).
export type TriggerEvent =
  | { type: 'set-layout'; layout: LayoutId }
  | { type: 'gag'; gag: GagId }
  | { type: 'set-member'; member: MemberId | null }
  | { type: 'set-phase'; phase: PhaseId | null }
  | { type: 'timer'; action: 'start' | 'stop'; durationMs?: number }
  | { type: 'set-text'; key: TextKey; text: string }
  | { type: 'set-bum-index'; index: number }
  | { type: 'sfx'; id: string }
  | { type: 'music'; action: 'play' | 'stop'; track?: string }
  | { type: 'music-volume'; volume: number };

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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

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
      setLayout,
      triggerGag,
      setActiveMember,
      setPhase,
      startTimer,
      stopTimer,
      setText,
      setBumIndex,
      setMusic,
      setMusicVolume,
    } = useOverlayStore.getState();
    switch (event.type) {
      case 'set-layout':
        setLayout(event.layout);
        break;
      case 'gag':
        triggerGag(event.gag);
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
    }
  };
  s.on('overlay-event', onOverlayEvent);
  return () => {
    s.off('overlay-event', onOverlayEvent);
  };
}
