import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '../../store/useOverlayStore';
import { resolveMediaUrl } from '../../socket';
import { retryOnFirstInteraction } from '../audio';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import './MediaLayer.css';

/**
 * Meme en pantalla (imagen/video disparado desde el panel, evento `media`).
 * Capa persistente montada por OverlayApp encima del chrome y debajo de los
 * gags. Tamaño/opacidad/volumen/posición se ajustan en vivo con `update`.
 * Ojo: opacidad < 1 sobre un agujero magenta se keyea a medias (glitch) —
 * es decisión del productor.
 */
export function MediaLayer() {
  const media = useOverlayStore((s) => s.media);

  return (
    <AnimatePresence>
      {media && (
        // key por URL: cambiar de meme re-anima la entrada.
        <motion.div
          key={media.url}
          className={`media-layer media-layer--${media.position}`}
          style={{ width: `${media.scale * 100}%`, opacity: media.opacity }}
          initial={{ scale: 0, rotate: -6 }}
          animate={{ scale: 1, rotate: media.position === 'center' ? -1 : 1.5, transition: SPRING_TORPE }}
          exit={{ scale: 0, rotate: 8, transition: CORTE_BRUSCO }}
        >
          {media.kind === 'image' ? (
            <img className="media-layer__content" src={resolveMediaUrl(media.url)} alt="" />
          ) : (
            <MediaVideo url={media.url} volume={media.volume} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MediaVideo({ url, volume }: { url: string; volume: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  // El volumen no es atributo de <video>: se setea imperativo y sigue al slider.
  useEffect(() => {
    if (ref.current) ref.current.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  // Autoplay con sonido: dentro de OBS siempre anda, pero un navegador normal
  // lo BLOQUEA si no hubo click previo en la página. Fallback: se reproduce
  // muteado (mejor meme sin sonido que ventana congelada) y al primer
  // click/tecla en la página recupera el sonido solo (overlay/audio.ts).
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.play().catch((err: DOMException) => {
      console.warn(`[audio] video con sonido bloqueado (${err.name}) — fallback muteado`);
      video.muted = true;
      video.play().catch((e: DOMException) => {
        console.warn(`[audio] video ni muteado pudo (${e.name}) — ¿códec no soportado? (ej. .mov raro)`);
      });
      retryOnFirstInteraction(() => {
        if (!video.isConnected) return; // el meme ya se ocultó
        video.muted = false;
        video.play().catch((e: DOMException) => console.warn(`[audio] video sigue sin sonido: ${e.name}`));
      });
    });
  }, [url]);

  return (
    <video
      ref={ref}
      className="media-layer__content"
      src={resolveMediaUrl(url)}
      autoPlay
      loop
      playsInline
    />
  );
}
