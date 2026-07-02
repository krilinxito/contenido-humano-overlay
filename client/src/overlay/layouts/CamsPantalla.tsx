import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBERS } from '../../config/members';
import { ScreenPlusCams } from './ScreenPlusCams';

/**
 * Layout general: 5 cams + pantalla compartida. Con `set-member` muestra la
 * pantalla de ese miembro; sin miembro, la del productor.
 */
export function CamsPantalla() {
  const member = useOverlayStore((s) => s.activeMember);
  const screenLabel = member ? `${MEMBERS[member].nombre} SCREEN` : 'PANTALLA DEL PRODUCTOR';
  const windowTitle = member
    ? `pantalla_de_${MEMBERS[member].nombre.toLowerCase()}.exe`
    : 'productor_screen_NO_TOCAR.exe';

  return (
    <motion.div
      className="layout-root gradient-aero scanlines"
      initial={{ opacity: 0, x: '6%', scale: 1.05 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, x: '-5%', transition: CORTE_BRUSCO }}
    >
      <ScreenPlusCams screenLabel={screenLabel} windowTitle={windowTitle} highlight={member} />
    </motion.div>
  );
}
