import { motion } from 'framer-motion';
import './GlitchInterrupt.css';

/**
 * Distorsión VHS/glitch a pantalla completa (~1.6s, ver GAG_DURATIONS_MS).
 * Cubre todo y desaparece solo; el layout de abajo nunca se desmonta.
 */
export function GlitchInterrupt() {
  return (
    <motion.div
      className="gag-root glitch-interrupt"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.05 } }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
    >
      <div className="glitch-interrupt__noise" />
      <div className="glitch-interrupt__slices">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={`glitch-interrupt__slice glitch-interrupt__slice--${i + 1}`} />
        ))}
      </div>
      <div className="glitch-interrupt__text chroma-text">SEÑAL PERDIDA</div>
      <div className="glitch-interrupt__tracking">TRACKING ▓▓▒▒░░ AJUSTE</div>
    </motion.div>
  );
}
