import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { LowPolyScene } from '../../three/LowPolyScene';
import './BrbBizarro.css';

/** Pantalla de "ya volvemos" con la escena 3D low-poly de protagonista. */
export function BrbBizarro() {
  const sub = useOverlayStore((s) => s.texts['brb-sub']);
  return (
    <motion.div
      className="layout-root brb-bizarro gradient-gag scanlines"
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.85, transition: CORTE_BRUSCO }}
    >
      <LowPolyScene />

      <div className="brb-bizarro__text-wrap">
        <motion.h1
          className="brb-bizarro__title chroma-text"
          initial={{ y: -200, rotate: -8 }}
          animate={{ y: 0, rotate: -3, transition: { ...SPRING_TORPE, delay: 0.2 } }}
        >
          YA VOLVEMOS
        </motion.h1>
        <motion.p
          className="brb-bizarro__subtitle"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 2, transition: { ...SPRING_TORPE, delay: 0.45 } }}
        >
          {sub}
        </motion.p>
        <div className="brb-bizarro__sparkles" aria-hidden="true">
          <span className="sparkle">✦</span>
          <span className="sparkle">★</span>
          <span className="sparkle">✧</span>
          <span className="sparkle">✦</span>
          <span className="sparkle">★</span>
        </div>
      </div>

      <div className="brb-bizarro__tape danger-tape" />
    </motion.div>
  );
}
