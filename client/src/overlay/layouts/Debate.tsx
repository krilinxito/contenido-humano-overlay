import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { CamCell } from '../chrome/CamCell';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { XPWindow } from '../chrome/XPWindow';
import { DoodleStar } from '../chrome/Doodles';
import './Debate.css';

/**
 * Debate post hot topic: el expositor (`set-member`) defiende su postura
 * en grande contra los otros 4. Sin miembro: grilla pareja de 5.
 */
export function Debate() {
  const defensor = useOverlayStore((s) => s.activeMember);
  const banner = useOverlayStore((s) => s.texts['debate-banner']);
  const vs = useOverlayStore((s) => s.texts['debate-vs']);
  const setTitle = useOverlayStore((s) => s.texts['window-set']);
  const retadores = MEMBER_IDS.filter((id) => id !== defensor);

  return (
    <motion.div
      className="layout-root debate gradient-gag scanlines"
      initial={{ opacity: 0, scale: 1.18, rotate: 1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.9, transition: CORTE_BRUSCO }}
    >
      {defensor === null ? (
        <div className="debate__even">
          {MEMBER_IDS.map((id, i) => (
            <motion.div
              key={id}
              className="debate__even-cell"
              initial={{ y: 160, rotate: i % 2 ? 4 : -4 }}
              animate={{ y: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: i * 0.06 } }}
            >
              <CamCell member={id} className="debate__cam" />
            </motion.div>
          ))}
          <div className="debate__banner danger-tape">
            <span className="debate__banner-text">{banner}</span>
          </div>
        </div>
      ) : (
        <div className="debate__versus">
          <motion.div
            className="debate__defensor"
            key={defensor}
            initial={{ x: -500, rotate: -5 }}
            animate={{ x: 0, rotate: -0.8, transition: SPRING_TORPE }}
          >
            <CamCell member={defensor} highlight className="debate__cam" />
          </motion.div>

          <motion.div
            className="debate__vs"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: -8, transition: { ...SPRING_TORPE, delay: 0.25 } }}
          >
            <span className="debate__vs-text chroma-text">{vs}</span>
            <DoodleStar className="debate__vs-star" size={110} />
          </motion.div>

          <div className="debate__retadores">
            {retadores.map((id, i) => (
              <motion.div
                key={id}
                initial={{ x: 400, rotate: 5 }}
                animate={{ x: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.1 + i * 0.07 } }}
              >
                <CamCell member={id} className="debate__cam" />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="debate__set"
            initial={{ y: 260, rotate: -6 }}
            animate={{ y: 0, rotate: -1.2, transition: { ...SPRING_TORPE, delay: 0.3 } }}
          >
            <XPWindow title={setTitle} className="debate__set-window">
              <CamPlaceholder label="EL SET" index={2} cam="general" />
            </XPWindow>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
