import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { ScreenPlusCams } from './ScreenPlusCams';
import { DoodleArrow, DoodleStar } from '../chrome/Doodles';
import './Tema.css';

/** Introducción del tema a debatir: visuales en pantalla + las 5 cams al costado. */
export function Tema() {
  const tema = useOverlayStore((s) => s.texts.tema);
  return (
    <motion.div
      className="layout-root tema gradient-kazaa scanlines"
      initial={{ opacity: 0, y: '-6%', scale: 1.06 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, y: '5%', transition: CORTE_BRUSCO }}
    >
      <ScreenPlusCams screenLabel="VISUALES DEL TEMA" windowTitle="tema_de_hoy_v4_AHORA_SI.mp4" />

      <motion.div
        className="tema__titulo bevel-out"
        initial={{ x: -480, rotate: -7 }}
        animate={{ x: 0, rotate: -2, transition: { ...SPRING_TORPE, delay: 0.25 } }}
      >
        <span className="tema__titulo-hoy">EL TEMA DE HOY:</span>
        <span className="tema__titulo-cual chroma-text">{tema}</span>
      </motion.div>

      <DoodleArrow className="tema__doodle-arrow" color="var(--warning-yellow)" />
      <DoodleStar className="tema__doodle-star" size={55} />
    </motion.div>
  );
}
