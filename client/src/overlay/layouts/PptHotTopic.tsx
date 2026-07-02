import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO, REBOTE_ZOCALO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBERS, MEMBER_IDS } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { ScreenPlaceholder } from '../chrome/ScreenPlaceholder';
import { CountdownTimer } from '../chrome/CountdownTimer';
import { DoodleStar, DoodleArrow } from '../chrome/Doodles';
import './PptHotTopic.css';

/**
 * Hot topic PPT: la presentación trucha del expositor (`set-member`) en
 * grande + su cam chica + countdown de 5 min (panel: botones de Timer).
 */
export function PptHotTopic() {
  const presenter = useOverlayStore((s) => s.activeMember);
  const tema = useOverlayStore((s) => s.texts.tema);
  const nombre = presenter ? MEMBERS[presenter].nombre : null;

  return (
    <motion.div
      className="layout-root ppt gradient-gag scanlines"
      initial={{ opacity: 0, scale: 1.12, rotate: -1 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.92, transition: CORTE_BRUSCO }}
    >
      <div className="ppt__screen">
        <XPWindow
          title="presentacion_final_v3_DEFINITIVA(1).ppt — PowerPoint"
          className="ppt__window"
        >
          <ScreenPlaceholder
            label={nombre ? `PPT TRUCHO DE ${nombre}` : 'PPT TRUCHO'}
            screen={presenter ? `screen-${presenter}` : 'screen-productor'}
          />
        </XPWindow>
        <motion.div
          className="ppt__tema"
          initial={{ x: -300, rotate: -5 }}
          animate={{ x: 0, rotate: -1.5, transition: { ...SPRING_TORPE, delay: 0.3 } }}
        >
          {tema}
        </motion.div>
      </div>

      <motion.div
        className="ppt__cam"
        initial={{ y: 300, rotate: 6 }}
        animate={{ y: 0, rotate: 2, transition: { ...SPRING_TORPE, delay: 0.2 } }}
      >
        <XPWindow title={nombre ? `${nombre.toLowerCase()}_expone.avi` : 'expositor.avi'} className="ppt__window">
          <CamPlaceholder
            label={nombre ? `CAM ${nombre}` : 'CAM EXPOSITOR'}
            index={presenter ? MEMBER_IDS.indexOf(presenter) : 0}
            cam={presenter ?? undefined}
          />
        </XPWindow>
      </motion.div>

      <motion.div
        className="ppt__timer sticker"
        initial={{ y: -260, rotate: -8 }}
        animate={{ y: 0, rotate: -3, transition: { ...REBOTE_ZOCALO, delay: 0.35 } }}
      >
        <span className="ppt__timer-label">TIEMPO RESTANTE</span>
        <CountdownTimer />
      </motion.div>

      <DoodleStar className="ppt__doodle-star" />
      <DoodleArrow className="ppt__doodle-arrow" color="var(--aero-lime)" />
    </motion.div>
  );
}
