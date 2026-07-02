// Reproducción de efectos de sonido (soundboard) en el overlay.
// Los SFX son one-shots sin estado: se disparan directo desde
// bindOverlaySocket() sin pasar por el store (excepción documentada en
// docs/EVENTS.md). La música sí es estado → chrome/Jukebox.tsx.

import { SFX_SOUNDS } from '../config/sounds';

export function playSfx(id: string) {
  const sfx = SFX_SOUNDS.find((s) => s.id === id);
  if (!sfx) {
    console.warn(`[audio] sfx desconocido: "${id}"`);
    return;
  }
  // Un Audio nuevo por disparo: los one-shots pueden solaparse.
  const audio = new Audio(sfx.url);
  audio.play().catch(() => {
    // Autoplay bloqueado: pasa solo en un navegador normal sin interacción
    // previa; dentro de OBS el autoplay está siempre permitido.
  });
}
