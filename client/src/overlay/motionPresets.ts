import type { Transition } from 'framer-motion';

// Presets de animación "torpes a propósito" — documentados en
// docs/DESIGN_SYSTEM.md (sección Motion). Usar estos, no inventar curvas
// por componente; si hace falta uno nuevo, agregarlo acá y documentarlo.

/** Overshoot exagerado con rebote visible. Default para entradas. */
export const SPRING_TORPE: Transition = {
  type: 'spring',
  stiffness: 550,
  damping: 14,
  mass: 1.1,
};

/** Casi un corte seco. Para salidas y glitches. */
export const CORTE_BRUSCO: Transition = {
  duration: 0.12,
  ease: [0.9, 0, 1, 0.1],
};

/** Entra desde el costado y rebota de más. Para zócalos/banners. */
export const REBOTE_ZOCALO: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 9,
};
