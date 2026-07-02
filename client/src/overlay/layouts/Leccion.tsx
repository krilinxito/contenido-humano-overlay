import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBERS } from '../../config/members';
import { ScreenPlusCams } from './ScreenPlusCams';
import { DoodleSquiggle, DoodleStar } from '../chrome/Doodles';
import './Leccion.css';

/**
 * Lección del tema: la pantalla del profe (elegido con `set-member`)
 * + strip con las 5 cams. El profe queda resaltado en el strip.
 */
export function Leccion() {
  const profe = useOverlayStore((s) => s.activeMember);
  const tema = useOverlayStore((s) => s.texts.tema);
  const screenLabel = profe ? `${MEMBERS[profe].nombre} SCREEN` : 'PANTALLA DEL PROFE';

  return (
    <motion.div
      className="layout-root leccion scanlines"
      initial={{ opacity: 0, y: '6%', scale: 1.06 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, y: '-5%', transition: CORTE_BRUSCO }}
    >
      <ScreenPlusCams
        screenLabel={screenLabel}
        windowTitle={profe ? `leccion_de_${MEMBERS[profe].nombre.toLowerCase()}.ppt` : 'leccion.ppt'}
        highlight={profe}
      />

      <motion.div
        className="leccion__titulo"
        initial={{ x: -420, rotate: -6 }}
        animate={{ x: 0, rotate: -2, transition: { ...SPRING_TORPE, delay: 0.25 } }}
      >
        <span className="leccion__titulo-text">LECCIÓN DE HOY</span>
        <span className="leccion__titulo-tema">{tema}</span>
        <DoodleSquiggle className="leccion__titulo-squiggle" color="var(--warning-yellow)" size={150} />
      </motion.div>

      <DoodleStar className="leccion__doodle-star" size={55} color="var(--aero-lime)" />
    </motion.div>
  );
}
