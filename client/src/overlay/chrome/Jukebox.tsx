import { useEffect, useRef } from 'react';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MUSIC_TRACKS } from '../../config/sounds';
import { retryOnFirstInteraction } from '../audio';

/**
 * Reproductor headless de música (no renderiza nada). Vive en OverlayApp
 * junto al chrome persistente: la música sobrevive a los cambios de layout.
 * Se controla desde el panel (`music` / `music-volume`, ver docs/EVENTS.md)
 * y suena dentro de OBS vía el audio del Browser Source.
 */
export function Jukebox() {
  const track = useOverlayStore((s) => s.musicTrack);
  const volume = useOverlayStore((s) => s.musicVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!track) return;
    const def = MUSIC_TRACKS.find((t) => t.id === track);
    if (!def) {
      console.warn(`[audio] track desconocido: "${track}"`);
      return;
    }
    const audio = new Audio(def.url);
    audio.loop = true;
    audio.volume = useOverlayStore.getState().musicVolume;
    audio.play().catch((err: DOMException) => {
      // Autoplay bloqueado (navegador normal sin click previo; en OBS no
      // pasa): la música arranca sola al primer click en la página — si el
      // track sigue siendo este (el guard evita resucitar audios viejos).
      console.warn(`[audio] música "${track}" no arrancó: ${err.name} — reintento al primer click`);
      retryOnFirstInteraction(() => {
        if (audioRef.current === audio)
          audio.play().catch((e: DOMException) => console.warn(`[audio] música "${track}" sigue bloqueada: ${e.name}`));
      });
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return null;
}
