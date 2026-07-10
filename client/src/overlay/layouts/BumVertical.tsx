import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { VideoPlaceholder } from '../chrome/VideoPlaceholder';
import { CamCell } from '../chrome/CamCell';
import { DoodleStar } from '../chrome/Doodles';
import './BumVertical.css';

const IZQUIERDA = MEMBER_IDS.slice(0, 3);
const DERECHA = MEMBER_IDS.slice(3);

/**
 * Best Unemployment Moments — reel/tiktok vertical al centro + cams a los
 * costados. `set-member` = de quién es el reel, `set-bum-index` = cuál de 5.
 */
export function BumVertical() {
  const dueno = useOverlayStore((s) => s.activeMember);
  const bumIndex = useOverlayStore((s) => s.bumIndex);
  const nombre = useOverlayStore((s) => (s.activeMember ? getMemberName(s.texts, s.activeMember) : null));
  const label = nombre ? `REEL ${bumIndex}/5 DE ${nombre}` : 'REEL DE LA SEMANA';

  return (
    <motion.div
      className="layout-root bum-v gradient-gag scanlines"
      initial={{ opacity: 0, scale: 1.12 }}
      animate={{ opacity: 1, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.9, transition: CORTE_BRUSCO }}
    >
      <div className="bum-v__col">
        {IZQUIERDA.map((id, i) => (
          <motion.div
            key={id}
            className="bum-v__cell"
            initial={{ x: -300, rotate: -4 }}
            animate={{ x: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.15 + i * 0.07 } }}
          >
            <CamCell member={id} highlight={id === dueno} className="bum-v__cam" />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bum-v__video"
        initial={{ y: '110%', rotate: 3 }}
        animate={{ y: 0, rotate: -0.8, transition: SPRING_TORPE }}
      >
        <VideoPlaceholder label={label} vertical screen="screen-bum" />
        {dueno && <span className="bum-counter sticker">{bumIndex}/5</span>}
      </motion.div>

      <div className="bum-v__col">
        {DERECHA.map((id, i) => (
          <motion.div
            key={id}
            className="bum-v__cell"
            initial={{ x: 300, rotate: 4 }}
            animate={{ x: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.15 + i * 0.07 } }}
          >
            <CamCell member={id} highlight={id === dueno} className="bum-v__cam" />
          </motion.div>
        ))}
      </div>

      <DoodleStar className="bum-v__doodle bum-v__doodle--1" size={55} />
      <DoodleStar className="bum-v__doodle bum-v__doodle--2" color="var(--aero-lime)" size={40} />
    </motion.div>
  );
}
