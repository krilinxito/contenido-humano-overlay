import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO, REBOTE_ZOCALO } from '../motionPresets';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { CamCell } from '../chrome/CamCell';
import { AvatarRow } from '../../three/avatars/AvatarRow';
import './Penitencia.css';

/**
 * El castigado (`set-member`) cumple su penitencia en grande, el resto
 * reacciona en columna. El texto de la penitencia viene de `set-penitencia`.
 */
export function Penitencia() {
  const castigado = useOverlayStore((s) => s.activeMember);
  const penitencia = useOverlayStore((s) => s.texts.penitencia);
  const pickTitle = useOverlayStore((s) => s.texts['penitencia-pick']);
  const cartelLabel = useOverlayStore((s) => s.texts['penitencia-label']);
  const testigosLabel = useOverlayStore((s) => s.texts['penitencia-testigos']);
  const setTitle = useOverlayStore((s) => s.texts['window-set']);
  const nombre = useOverlayStore((s) => (s.activeMember ? getMemberName(s.texts, s.activeMember) : null));
  const testigos = MEMBER_IDS.filter((id) => id !== castigado);

  return (
    <motion.div
      className="layout-root penitencia scanlines"
      initial={{ opacity: 0, scale: 1.1, rotate: -1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.92, transition: CORTE_BRUSCO }}
    >
      {castigado === null ? (
        <div className="penitencia__pick">
          <motion.h1
            className="penitencia__pick-title chroma-text"
            initial={{ scale: 0, rotate: -6 }}
            animate={{ scale: 1, rotate: -2, transition: SPRING_TORPE }}
          >
            {pickTitle}
          </motion.h1>
          <motion.div
            className="penitencia__pick-row"
            initial={{ y: 220 }}
            animate={{ y: 0, transition: { ...SPRING_TORPE, delay: 0.15 } }}
          >
            <AvatarRow members={MEMBER_IDS} />
          </motion.div>
        </div>
      ) : (
        <div className="penitencia__stage">
          <motion.div
            className="penitencia__castigado"
            key={castigado}
            initial={{ scale: 0.85, rotate: 2 }}
            animate={{ scale: 1, rotate: -0.5, transition: SPRING_TORPE }}
          >
            <div className="penitencia__marco danger-tape">
              <XPWindow title={`${(nombre ?? '').toLowerCase()}_pagando.avi`} className="penitencia__window">
                <CamPlaceholder
                  label={`CAM ${nombre}`}
                  index={MEMBER_IDS.indexOf(castigado)}
                  cam={castigado}
                />
              </XPWindow>
            </div>
            <motion.div
              className="penitencia__cartel bevel-out"
              initial={{ y: 160, rotate: -4 }}
              animate={{ y: 0, rotate: -1.5, transition: { ...REBOTE_ZOCALO, delay: 0.4 } }}
            >
              <span className="penitencia__cartel-label">{cartelLabel}</span>
              <span className="penitencia__cartel-text">{penitencia || 'penitencia sorpresa'}</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="penitencia__set"
            initial={{ y: -260, rotate: -7 }}
            animate={{ y: 0, rotate: -2, transition: { ...SPRING_TORPE, delay: 0.3 } }}
          >
            <XPWindow title={setTitle} className="penitencia__set-window">
              <CamPlaceholder label="EL SET" index={2} cam="general" />
            </XPWindow>
          </motion.div>

          <div className="penitencia__testigos">
            <span className="penitencia__testigos-label">{testigosLabel}</span>
            {testigos.map((id, i) => (
              <motion.div
                key={id}
                className="penitencia__testigo"
                initial={{ x: 300, rotate: 4 }}
                animate={{ x: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.2 + i * 0.07 } }}
              >
                <CamCell member={id} className="penitencia__cam" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
