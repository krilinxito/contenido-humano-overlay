// Reporter de ventanas de cámara (modo cámaras reales, ver docs/ARCHITECTURE.md).
//
// En modo `?cams=real` cada CamPlaceholder con prop `cam` se registra acá; un
// polling mide sus getBoundingClientRect(), los normaliza 0..1 y los manda al
// server (`cam-rects`), que los traduce a transforms de OBS (server/obs.js).
// El overlay NUNCA habla obs-websocket directo: solo reporta rects.
//
// Poner `&cams=real` en UNA sola Browser Source de OBS — si dos instancias
// reportan a la vez, las cámaras se pelean (ver docs/PRODUCCION.md).

import { emitCamRects, getSocket, type CamRect } from '../socket';
import { useOverlayStore } from '../store/useOverlayStore';
import type { HoleId } from '../config/cams';

/** Leído UNA vez al arrancar, igual que `?layout=` — sin navegación. */
export const CAMS_REAL = new URLSearchParams(window.location.search).get('cams') === 'real';

const registry = new Map<HTMLElement, HoleId>();

/** Registra el elemento-agujero de una cam o pantalla. Devuelve el cleanup. */
export function registerCamHole(el: HTMLElement, cam: HoleId): () => void {
  registry.set(el, cam);
  return () => {
    registry.delete(el);
  };
}

// 300ms alcanza: las ventanas solo se mueven en las entradas/salidas animadas
// de los layouts; en reposo no se re-emite nada (ver umbral abajo).
const POLL_MS = 300;

// ~7px a 1920 de ancho: filtra el jitter subpíxel de los transforms
// wobble/rotate sin dejar pasar movimientos reales.
const THRESHOLD = 0.004;

function snapshot(): CamRect[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw === 0 || vh === 0) return [];
  const rects: CamRect[] = [];
  for (const [el, cam] of registry) {
    if (!el.isConnected) {
      registry.delete(el);
      continue;
    }
    const r = el.getBoundingClientRect();
    // Celdas colapsadas o en pleno exit de AnimatePresence no valen.
    if (r.width < 4 || r.height < 4) continue;
    rects.push({ cam, x: r.left / vw, y: r.top / vh, w: r.width / vw, h: r.height / vh });
  }
  rects.sort((a, b) => a.cam.localeCompare(b.cam));
  return rects;
}

function sameRects(a: CamRect[], b: CamRect[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((ra, i) => {
    const rb = b[i];
    return (
      ra.cam === rb.cam &&
      Math.abs(ra.x - rb.x) < THRESHOLD &&
      Math.abs(ra.y - rb.y) < THRESHOLD &&
      Math.abs(ra.w - rb.w) < THRESHOLD &&
      Math.abs(ra.h - rb.h) < THRESHOLD
    );
  });
}

/**
 * Lo llama OverlayApp una sola vez. No hace nada fuera de `?cams=real`
 * (en dev sin OBS se ven los placeholders de siempre y no se emite nada).
 */
export function startCamRectReporting(): () => void {
  if (!CAMS_REAL) return () => {};
  let lastSent: CamRect[] | null = null;
  // Si el server se reinicia pierde los rects: al reconectar se re-emite todo.
  const socket = getSocket();
  const onReconnect = () => {
    lastSent = null;
  };
  socket.on('connect', onReconnect);
  const id = setInterval(() => {
    const rects = snapshot();
    if (lastSent !== null && sameRects(lastSent, rects)) return;
    lastSent = rects;
    emitCamRects({ layout: useOverlayStore.getState().layout, rects });
  }, POLL_MS);
  return () => {
    clearInterval(id);
    socket.off('connect', onReconnect);
  };
}
