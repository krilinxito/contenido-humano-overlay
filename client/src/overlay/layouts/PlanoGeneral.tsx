import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { XPWindow } from '../chrome/XPWindow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { FakeChat } from '../chrome/FakeChat';
import './PlanoGeneral.css';

/** Plano general grande + panel de chat falso estilo mensajero retro. */
export function PlanoGeneral() {
  const camTitle = useOverlayStore((s) => s.texts['window-plano-general']);
  const chatTitle = useOverlayStore((s) => s.texts['window-chat']);
  return (
    <motion.div
      className="layout-root plano-general gradient-aero scanlines"
      initial={{ opacity: 0, x: '-6%', scale: 1.05 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, x: '5%', transition: CORTE_BRUSCO }}
    >
      <motion.div
        className="plano-general__cam"
        initial={{ scale: 0.9, rotate: -1.2 }}
        animate={{ scale: 1, rotate: -0.4, transition: SPRING_TORPE }}
      >
        <XPWindow title={camTitle} className="plano-general__window">
          <CamPlaceholder label="CAM GENERAL" index={2} cam="general" />
        </XPWindow>
      </motion.div>

      <motion.aside
        className="plano-general__chat"
        initial={{ x: '120%' }}
        animate={{ x: 0, transition: { ...SPRING_TORPE, delay: 0.15 } }}
      >
        <XPWindow title={chatTitle} className="plano-general__window">
          <FakeChat />
        </XPWindow>
      </motion.aside>
    </motion.div>
  );
}
