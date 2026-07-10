import { motion } from 'framer-motion';
import { CORTE_BRUSCO, REBOTE_ZOCALO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { MarqueeText } from '../chrome/MarqueeText';
import './Noticiero.css';

/** 1 cámara + zócalo tipo noticiero con título animado + bug del programa. */
export function Noticiero() {
  const zocalo = useOverlayStore((s) => s.texts.zocalo);
  const ticker = useOverlayStore((s) => s.texts.ticker);
  const tag = useOverlayStore((s) => s.texts['noticiero-tag']);
  return (
    <motion.div
      className="layout-root noticiero scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.18 } }}
      exit={{ opacity: 0, transition: CORTE_BRUSCO }}
    >
      <CamPlaceholder label="CAM NOTICIERO" index={3} cam="noticiero" />

      {/* El bug CH lo pone OverlayApp de forma persistente (chrome/CHBug.tsx) */}

      {/* Zócalo inferior */}
      <div className="noticiero__zocalo">
        <motion.div
          className="noticiero__titulo bevel-out"
          initial={{ x: '-115%' }}
          animate={{ x: 0, transition: { ...REBOTE_ZOCALO, delay: 0.2 } }}
          exit={{ x: '-115%', transition: CORTE_BRUSCO }}
        >
          <span className="noticiero__titulo-tag">{tag}</span>
          <span className="noticiero__titulo-text chroma-text">{zocalo}</span>
        </motion.div>
        <motion.div
          className="noticiero__ticker"
          initial={{ y: '110%' }}
          animate={{ y: 0, transition: { ...REBOTE_ZOCALO, delay: 0.45 } }}
          exit={{ y: '110%', transition: CORTE_BRUSCO }}
        >
          <MarqueeText text={ticker + ticker} className="noticiero__ticker-marquee" />
        </motion.div>
      </div>
    </motion.div>
  );
}
