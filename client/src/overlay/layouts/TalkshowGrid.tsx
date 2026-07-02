import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { MEMBER_IDS } from '../../config/members';
import { XPWindow } from '../chrome/XPWindow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import './TalkshowGrid.css';

const PERSONAS = ['El Anfitrión', 'Invitade 1', 'Invitade 2', 'La Productora', 'Señor Random'];

/** 5 cámaras tipo Brady Bunch / Zoom call, cada una en su ventana XP. */
export function TalkshowGrid() {
  return (
    <motion.div
      className="layout-root talkshow-grid gradient-kazaa scanlines"
      initial={{ opacity: 0, scale: 1.15, rotate: -1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.93, transition: CORTE_BRUSCO }}
    >
      {PERSONAS.map((nombre, i) => (
        <motion.div
          key={nombre}
          className={`talkshow-grid__cell talkshow-grid__cell--${i + 1}`}
          initial={{ y: 80, opacity: 0, rotate: i % 2 ? 2.5 : -2.5 }}
          animate={{
            y: 0,
            opacity: 1,
            rotate: i % 2 ? 0.9 : -0.9,
            transition: { ...SPRING_TORPE, delay: i * 0.07 },
          }}
        >
          <XPWindow title={`${nombre}.avi`} className="talkshow-grid__window">
            <CamPlaceholder label={`CAM ${i + 1}`} index={i} cam={MEMBER_IDS[i]} />
          </XPWindow>
        </motion.div>
      ))}
    </motion.div>
  );
}
