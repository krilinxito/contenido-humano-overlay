// Reproducción de efectos de sonido (soundboard) en el overlay.
// Los SFX son one-shots sin estado: se disparan directo desde
// bindOverlaySocket() sin pasar por el store (excepción documentada en
// docs/EVENTS.md). La música sí es estado → chrome/Jukebox.tsx.

import { SFX_SOUNDS } from '../config/sounds';

// ---- Desbloqueo de audio en previews de navegador ----
// Un navegador normal bloquea TODO el audio hasta el primer gesto en la
// página (dentro de OBS nunca pasa: autoplay siempre permitido). Los
// reproductores con estado (música, video de memes) registran acá un
// reintento que se dispara UNA vez, al primer click/tecla. Los SFX one-shot
// no se registran: reproducirlos tarde sería peor que perderlos.

const pendingRetries = new Set<() => void>();
let unlockBound = false;

export function retryOnFirstInteraction(retry: () => void) {
  pendingRetries.add(retry);
  if (unlockBound) return;
  unlockBound = true;
  const unlock = () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    unlockBound = false;
    const retries = [...pendingRetries];
    pendingRetries.clear();
    retries.forEach((fn) => fn());
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

export function playSfx(id: string) {
  const sfx = SFX_SOUNDS.find((s) => s.id === id);
  if (!sfx) {
    console.warn(`[audio] sfx desconocido: "${id}"`);
    return;
  }
  // Un Audio nuevo por disparo: los one-shots pueden solaparse.
  const audio = new Audio(sfx.url);
  audio.play().catch((err: DOMException) => {
    // NotAllowedError = autoplay bloqueado (navegador sin gesto previo; en
    // OBS no pasa). Otro error = problema real (códec, URL) — mirar consola.
    console.warn(`[audio] sfx "${id}" no sonó: ${err.name} — ${err.message}`);
  });
}
