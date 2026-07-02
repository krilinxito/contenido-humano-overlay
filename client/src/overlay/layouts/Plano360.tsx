import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { DoodleSquiggle } from '../chrome/Doodles';
import './Plano360.css';

const RING_TEXT = '360° · 360° · 360° · 360° · 360° · 360° · 360° · 360° · ';

/** Plano dinámico: cámara en trípode 360 a pantalla completa + decoración giratoria. */
export function Plano360() {
  return (
    <motion.div
      className="layout-root plano-360 scanlines"
      initial={{ opacity: 0, rotate: -4, scale: 1.15 }}
      animate={{ opacity: 1, rotate: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, rotate: 3, scale: 0.9, transition: CORTE_BRUSCO }}
    >
      <CamPlaceholder label="CAM 360" index={4} cam="plano360" />

      {/* anillo de texto girando */}
      <div className="plano-360__ring-wrap" aria-hidden="true">
        <svg className="plano-360__ring" viewBox="0 0 200 200">
          <defs>
            <path id="ring-circle" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
          </defs>
          <text className="plano-360__ring-text">
            <textPath href="#ring-circle">{RING_TEXT}</textPath>
          </text>
        </svg>
      </div>

      <div className="plano-360__label blink-hard">⟳ CÁMARA MAREADA ⟳</div>
      <DoodleSquiggle className="plano-360__doodle" color="var(--y2k-magenta)" size={160} />
    </motion.div>
  );
}
