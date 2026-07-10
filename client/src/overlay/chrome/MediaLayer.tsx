import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '../../store/useOverlayStore';
import { resolveMediaUrl } from '../../socket';
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
  // lo BLOQUEA si no hubo click previo en la página ("a veces se reproduce y
  // a veces no"). Fallback: si el play() con audio falla, se reproduce
  // muteado — mejor meme sin sonido que ventana congelada. (Igual que el
  // audio del jukebox: en previews de navegador, click en la página primero.)
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {
        /* sin video posible (códec no soportado, ej. .mov raro) */
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
