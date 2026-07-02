import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore, type PhaseId } from '../../store/useOverlayStore';
import { REBOTE_ZOCALO, CORTE_BRUSCO } from '../motionPresets';
import './PhaseBanner.css';

const PHASE_LABELS: Record<PhaseId, string> = {
  tertulia: 'TERTULIA',
  tema: 'EL TEMA',
  leccion: 'LECCIÓN',
  'hot-topics': 'HOT TOPICS PPT',
  debate: 'DEBATE',
  perdedor: 'EL MÁS PAPEADO',
  juego: 'JUEGO',
  bum: 'BEST UNEMPLOYMENT MOMENTS',
};

/**
 * Banner superior con la fase actual del rundown. Controlado desde el panel
 * (`set-phase`); null = oculto. Persistente sobre cualquier layout.
 */
export function PhaseBanner() {
  const phase = useOverlayStore((s) => s.phase);

  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          key={phase}
          className="phase-banner bevel-out"
          initial={{ y: '-160%', rotate: -3 }}
          animate={{ y: 0, rotate: -1, transition: REBOTE_ZOCALO }}
          exit={{ y: '-160%', transition: CORTE_BRUSCO }}
        >
          <span className="phase-banner__now">AHORA:</span>
          <span className="phase-banner__label chroma-text">{PHASE_LABELS[phase]}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
