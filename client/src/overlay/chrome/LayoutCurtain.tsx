import { useMemo, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '../../store/useOverlayStore';
import { GlitchScreen } from '../gags/GlitchInterrupt';
import './LayoutCurtain.css';

// Cortinilla de transición entre layouts: capa 100% OPACA (regla: nada
// semitransparente sobre agujeros magenta) que tapa la pantalla mientras el
// store conmuta el layout y OBS reposiciona sus fuentes (timings CURTAIN_*_MS
// en useOverlayStore.ts). Tres variantes, una al azar por aparición — cada
// una con su PROPIA animación de entrada/salida. Restricción común: la
// entrada debe cubrir TODO el viewport antes de CURTAIN_IN_MS (280ms).

type Variante = 'teatro' | 'kazaa' | 'glitch';
const VARIANTES: Variante[] = ['teatro', 'kazaa', 'glitch'];

/** Easing cuantizado: el movimiento avanza en 6 saltos, como sprite de
 *  consola de 16 bits (mismo lenguaje que los steps() de CSS). */
const EASE_STEPS = (t: number) => Math.round(t * 6) / 6;

/** Cortina de teatro pixelada: dos hojas plisadas (3D falso tipo SNES) que
 *  se cierran desde los costados a saltos. Cada hoja mide 52% y se solapan
 *  en el centro para que no quede ranura con la cortina cerrada. */
function CurtainTeatro() {
  return (
    <motion.div className="layout-curtain">
      {(['left', 'right'] as const).map((side) => (
        <motion.div
          key={side}
          className={`curtain-teatro__half curtain-teatro__half--${side}`}
          initial={{ x: side === 'left' ? '-104%' : '104%' }}
          animate={{ x: 0, transition: { duration: 0.24, ease: EASE_STEPS } }}
          exit={{ x: side === 'left' ? '-104%' : '104%', transition: { duration: 0.26, ease: EASE_STEPS } }}
        />
      ))}
    </motion.div>
  );
}

/** Panel Kazaa con el logo CH: baja desde arriba y se va como un CRT
 *  apagándose (se aplasta a una línea y colapsa a un punto — siempre opaco,
 *  nunca se desliza al salir). */
function CurtainKazaa() {
  const eslogan = useOverlayStore((s) => s.texts.eslogan);
  return (
    <motion.div
      className="layout-curtain"
      initial={{ y: '-104%' }}
      animate={{ y: 0, transition: { duration: 0.22, ease: [0.8, 0, 0.9, 0.4] } }}
      exit={{
        scaleY: [1, 0.006, 0.006],
        scaleX: [1, 1, 0.002],
        transition: { duration: 0.3, times: [0, 0.55, 1], ease: 'easeIn' },
      }}
    >
      <div className="curtain__fill curtain--kazaa gradient-kazaa">
        <span className="curtain__ch">CH</span>
        <span className="curtain__slogan">{eslogan}</span>
        <span className="curtain__loading blink-hard">cargando escena…</span>
      </div>
    </motion.div>
  );
}

/** Error técnico: reusa el visual del gag GlitchInterrupt (GlitchScreen).
 *  Entra y sale con corte seco de duración 0 — "se corta la señal" (y sin
 *  frames semitransparentes sobre los agujeros magenta). */
function CurtainGlitch() {
  return (
    <motion.div
      className="layout-curtain glitch-interrupt"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0 } }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      <GlitchScreen />
    </motion.div>
  );
}

const RENDER: Record<Variante, ComponentType> = {
  teatro: CurtainTeatro,
  kazaa: CurtainKazaa,
  glitch: CurtainGlitch,
};

/** Cortinilla de cambio de layout (montada por OverlayApp, z encima de todo). */
export function LayoutCurtain() {
  const visible = useOverlayStore((s) => s.curtain);

  return (
    <AnimatePresence>
      {visible && <CurtainPanel key="curtain" />}
    </AnimatePresence>
  );
}

function CurtainPanel() {
  // Variante random calculada una vez por aparición (patrón de SapoRandom).
  const variante = useMemo(() => VARIANTES[Math.floor(Math.random() * VARIANTES.length)], []);
  const Contenido = RENDER[variante];
  return <Contenido />;
}
