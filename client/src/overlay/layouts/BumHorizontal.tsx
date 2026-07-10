import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { VideoPlaceholder } from '../chrome/VideoPlaceholder';
import { CamCell } from '../chrome/CamCell';
import './BumHorizontal.css';

/**
 * Best Unemployment Moments — video horizontal + las 5 cams reaccionando.
 * Cada miembro trae sus 5 videos: `set-member` elige de quién y
 * `set-bum-index` cuál de los 5 va (su cam queda resaltada).
 */
export function BumHorizontal() {
  const dueno = useOverlayStore((s) => s.activeMember);
  const bumIndex = useOverlayStore((s) => s.bumIndex);
  const nombre = useOverlayStore((s) => (s.activeMember ? getMemberName(s.texts, s.activeMember) : null));
  const label = nombre ? `VIDEO ${bumIndex}/5 DE ${nombre}` : 'VIDEO DE LA SEMANA';
  const windowTitle = nombre
    ? `bum_${nombre.toLowerCase()}_${bumIndex}de5.mp4 - Reproductor`
    : 'reel_que_vio_la_gente (34) - Reproductor';

  return (
    <motion.div
      className="layout-root bum-h gradient-kazaa scanlines"
      initial={{ opacity: 0, y: '8%', scale: 1.05 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, y: '-6%', transition: CORTE_BRUSCO }}
    >
      <motion.div
        className="bum-h__video"
        initial={{ scale: 0.85, rotate: 1.5 }}
        animate={{ scale: 1, rotate: -0.4, transition: SPRING_TORPE }}
      >
        <XPWindow title={windowTitle} className="bum-h__window">
          <VideoPlaceholder label={label} screen="screen-bum" />
        </XPWindow>
        {dueno && <span className="bum-counter sticker">{bumIndex}/5</span>}
      </motion.div>

      <div className="bum-h__strip">
        {MEMBER_IDS.map((id, i) => (
          <motion.div
            key={id}
            className="bum-h__cell"
            initial={{ y: 180, rotate: i % 2 ? 3 : -3 }}
            animate={{ y: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.15 + i * 0.06 } }}
          >
            <CamCell member={id} highlight={id === dueno} className="bum-h__cam" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
