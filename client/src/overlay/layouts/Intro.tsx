import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { AvatarRow } from '../../three/avatars/AvatarRow';
import { CHBug, SLOGAN } from '../chrome/CHBug';
import { XPWindow } from '../chrome/XPWindow';
import { FakeChat } from '../chrome/FakeChat';
import { MarqueeText } from '../chrome/MarqueeText';
import { DoodleArrow, DoodleStar, DoodleSquiggle } from '../chrome/Doodles';
import './Intro.css';

/** Pantalla de arranque del stream: logo CH gigante, eslogan, los 5 en 3D y chat. */
export function Intro() {
  const marquee = useOverlayStore((s) => s.texts['intro-marquee']);

  return (
    <motion.div
      className="layout-root intro gradient-aero scanlines"
      initial={{ opacity: 0, scale: 1.2, rotate: 1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.9, transition: CORTE_BRUSCO }}
    >
      <div className="intro__main">
        <motion.div
          className="intro__logo"
          initial={{ y: -320, rotate: -12 }}
          animate={{ y: 0, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.1 } }}
        >
          <CHBug className="ch-bug-wrap--xl" showSlogan={false} />
        </motion.div>

        <motion.p
          className="intro__slogan hand-underline"
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { ...SPRING_TORPE, delay: 0.4 } }}
        >
          {SLOGAN}
        </motion.p>

        <motion.div
          className="intro__avatars"
          initial={{ y: 260 }}
          animate={{ y: 0, transition: { ...SPRING_TORPE, delay: 0.55 } }}
        >
          <AvatarRow members={MEMBER_IDS} />
        </motion.div>
      </div>

      <motion.aside
        className="intro__chat"
        initial={{ x: '130%' }}
        animate={{ x: 0, transition: { ...SPRING_TORPE, delay: 0.7 } }}
      >
        <XPWindow title="chat_en_vivo.exe" className="intro__chat-window">
          <FakeChat />
        </XPWindow>
      </motion.aside>

      {/* doodles decorativos */}
      <DoodleStar className="intro__doodle intro__doodle--star1" />
      <DoodleStar className="intro__doodle intro__doodle--star2" color="var(--y2k-magenta)" size={50} />
      <DoodleArrow className="intro__doodle intro__doodle--arrow" />
      <DoodleSquiggle className="intro__doodle intro__doodle--squiggle" />

      <div className="intro__marquee-wrap danger-tape">
        <MarqueeText text={marquee} className="intro__marquee" />
      </div>
    </motion.div>
  );
}
