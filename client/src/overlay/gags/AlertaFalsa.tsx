import { motion } from 'framer-motion';
import { REBOTE_ZOCALO, CORTE_BRUSCO } from '../motionPresets';
import { MarqueeText } from '../chrome/MarqueeText';
import './AlertaFalsa.css';

/** Banner BREAKING NEWS exagerado con parpadeo y shake (~3.2s). */
export function AlertaFalsa() {
  return (
    <motion.div
      className="gag-root alerta-falsa"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.05 } }}
      exit={{ opacity: 0, transition: CORTE_BRUSCO }}
    >
      <div className="alerta-falsa__flash blink-hard" />
      <motion.div
        className="alerta-falsa__banner shake-hard"
        initial={{ y: '-350%', rotate: -4 }}
        animate={{ y: 0, rotate: -1, transition: REBOTE_ZOCALO }}
        exit={{ y: '-350%', transition: CORTE_BRUSCO }}
      >
        <div className="alerta-falsa__tape danger-tape" />
        <div className="alerta-falsa__title chroma-text">‼ BREAKING NEWS ‼</div>
        <div className="alerta-falsa__subtitle">ATENCIÓN: NO ESTÁ PASANDO ABSOLUTAMENTE NADA</div>
        <MarqueeText
          text="ESTO ES UNA ALERTA FALSA ★ REPETIMOS: FALSA ★ SIGA CON LO SUYO ★ O NO ★ "
          className="alerta-falsa__marquee"
        />
        <div className="alerta-falsa__tape danger-tape" />
      </motion.div>
    </motion.div>
  );
}
