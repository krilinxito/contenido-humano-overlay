import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { MemberBadge } from '../chrome/MemberBadge';
import { AvatarRow } from '../../three/avatars/AvatarRow';
import { DoodleArrow, DoodleCircle } from '../chrome/Doodles';
import './Tertulia.css';

/**
 * Presentación de la tertulia: cam individual del que habla + badge grande
 * con su avatar 3D y adjetivo. El panel elige quién con `set-member`;
 * sin miembro elegido muestra la selección "¿quién empieza?".
 */
export function Tertulia() {
  const activeMember = useOverlayStore((s) => s.activeMember);
  const pickTitle = useOverlayStore((s) => s.texts['tertulia-pick']);
  const setTitle = useOverlayStore((s) => s.texts['window-set']);
  const nombre = useOverlayStore((s) => (s.activeMember ? getMemberName(s.texts, s.activeMember) : null));

  return (
    <motion.div
      className="layout-root tertulia gradient-kazaa scanlines"
      initial={{ opacity: 0, x: '8%', scale: 1.08 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, x: '-6%', transition: CORTE_BRUSCO }}
    >
      {activeMember === null ? (
        <div className="tertulia__pick">
          <motion.h1
            className="tertulia__pick-title chroma-text"
            initial={{ scale: 0, rotate: 8 }}
            animate={{ scale: 1, rotate: -2, transition: SPRING_TORPE }}
          >
            {pickTitle}
          </motion.h1>
          <motion.div
            className="tertulia__pick-row"
            initial={{ y: 220 }}
            animate={{ y: 0, transition: { ...SPRING_TORPE, delay: 0.15 } }}
          >
            <AvatarRow members={MEMBER_IDS} />
          </motion.div>
        </div>
      ) : (
        <div className="tertulia__stage">
          <motion.div
            className="tertulia__cam"
            key={activeMember}
            initial={{ scale: 0.85, rotate: -2 }}
            animate={{ scale: 1, rotate: -0.5, transition: SPRING_TORPE }}
          >
            <XPWindow title={`${(nombre ?? '').toLowerCase()}_en_vivo.avi`} className="tertulia__window">
              <CamPlaceholder
                label={`CAM ${nombre}`}
                index={MEMBER_IDS.indexOf(activeMember)}
                cam={activeMember}
              />
            </XPWindow>
          </motion.div>

          {/* Columna derecha: badge arriba + ventana del set abajo, en flujo
              (compartían la esquina como absolutes y la ventana pisaba al avatar). */}
          <div className="tertulia__side">
            <motion.div
              className="tertulia__badge"
              key={`badge-${activeMember}`}
              initial={{ x: 400, rotate: 15 }}
              animate={{ x: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.15 } }}
            >
              <MemberBadge member={activeMember} size="lg" />
              <DoodleArrow className="tertulia__arrow" size={110} />
            </motion.div>

            <motion.div
              className="tertulia__set"
              initial={{ y: 260, rotate: 6 }}
              animate={{ y: 0, rotate: 1.6, transition: { ...SPRING_TORPE, delay: 0.25 } }}
            >
              <XPWindow title={setTitle} className="tertulia__set-window">
                <CamPlaceholder label="EL SET" index={2} cam="general" />
              </XPWindow>
            </motion.div>
          </div>

          <DoodleCircle className="tertulia__doodle-circle" size={120} />
        </div>
      )}
    </motion.div>
  );
}
