import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO, REBOTE_ZOCALO } from '../motionPresets';
import { useOverlayStore } from '../../store/useOverlayStore';
import { MEMBER_IDS } from '../../config/members';
import { MemberBadge } from '../chrome/MemberBadge';
import { AvatarRow } from '../../three/avatars/AvatarRow';
import { CamPlaceholder } from '../chrome/CamPlaceholder';
import { XPWindow } from '../chrome/XPWindow';
import { DoodleArrow } from '../chrome/Doodles';
import './Papeado.css';

/**
 * Ceremonia del más papeado del día. Sin `set-member`: redoble con los 5
 * candidatos. Con miembro: spotlight sobre el perdedor + sello PAPEADO +
 * su penitencia (si el panel la seteó con `set-penitencia`).
 */
export function Papeado() {
  const perdedor = useOverlayStore((s) => s.activeMember);
  const penitencia = useOverlayStore((s) => s.texts.penitencia);
  const titulo = useOverlayStore((s) => s.texts['papeado-titulo']);
  const redoble = useOverlayStore((s) => s.texts['papeado-redoble']);
  const sello = useOverlayStore((s) => s.texts['papeado-sello']);
  const penitenciaLabel = useOverlayStore((s) => s.texts['papeado-label']);
  const setTitle = useOverlayStore((s) => s.texts['window-set']);

  return (
    <motion.div
      className="layout-root papeado scanlines"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.9, transition: CORTE_BRUSCO }}
    >
      <div className="papeado__titulo-wrap danger-tape">
        <motion.h1
          className="papeado__titulo chroma-text"
          initial={{ y: -180 }}
          animate={{ y: 0, transition: REBOTE_ZOCALO }}
        >
          {titulo}
        </motion.h1>
      </div>

      {perdedor === null ? (
        <div className="papeado__candidatos">
          <div className="papeado__redoble blink-hard">{redoble}</div>
          <motion.div
            className="papeado__row"
            initial={{ y: 220 }}
            animate={{ y: 0, transition: { ...SPRING_TORPE, delay: 0.15 } }}
          >
            <AvatarRow members={MEMBER_IDS} />
          </motion.div>
        </div>
      ) : (
        <div className="papeado__spotlight-wrap">
          <div className="papeado__spotlight" />
          <motion.div
            className="papeado__perdedor"
            key={perdedor}
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1.15, rotate: 0, transition: { ...SPRING_TORPE, delay: 0.2 } }}
          >
            <MemberBadge member={perdedor} size="lg" />
            <motion.span
              className="papeado__sello"
              initial={{ scale: 4, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: -18, transition: { ...CORTE_BRUSCO, delay: 0.6 } }}
            >
              {sello}
            </motion.span>
          </motion.div>

          {penitencia !== '' && (
            <motion.div
              className="papeado__penitencia bevel-out"
              initial={{ y: 240, rotate: 4 }}
              animate={{ y: 0, rotate: 1.5, transition: { ...REBOTE_ZOCALO, delay: 0.9 } }}
            >
              <span className="papeado__penitencia-label">{penitenciaLabel}</span>
              <span className="papeado__penitencia-text">{penitencia}</span>
            </motion.div>
          )}

          <DoodleArrow className="papeado__doodle-arrow" color="var(--warning-yellow)" size={130} />
        </div>
      )}

      <motion.div
        className="papeado__set"
        initial={{ y: 260, rotate: 7 }}
        animate={{ y: 0, rotate: 2, transition: { ...SPRING_TORPE, delay: 0.35 } }}
      >
        <XPWindow title={setTitle} className="papeado__set-window">
          <CamPlaceholder label="EL SET" index={2} cam="general" />
        </XPWindow>
      </motion.div>
    </motion.div>
  );
}
