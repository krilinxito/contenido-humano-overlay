import { useEffect, type ComponentType } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOverlayStore, type LayoutId, type GagId } from '../store/useOverlayStore';
import { bindOverlaySocket } from '../socket';
import { startCamRectReporting } from './camRectReporter';
import { WobbleFilterDefs } from './chrome/WobbleFilterDefs';
import { CHBug } from './chrome/CHBug';
import { PhaseBanner } from './chrome/PhaseBanner';
import { Jukebox } from './chrome/Jukebox';
import { TalkshowGrid } from './layouts/TalkshowGrid';
import { PlanoGeneral } from './layouts/PlanoGeneral';
import { Noticiero } from './layouts/Noticiero';
import { BrbBizarro } from './layouts/BrbBizarro';
import { Intro } from './layouts/Intro';
import { Tertulia } from './layouts/Tertulia';
import { Leccion } from './layouts/Leccion';
import { PptHotTopic } from './layouts/PptHotTopic';
import { Tema } from './layouts/Tema';
import { Debate } from './layouts/Debate';
import { Papeado } from './layouts/Papeado';
import { BumHorizontal } from './layouts/BumHorizontal';
import { BumVertical } from './layouts/BumVertical';
import { Penitencia } from './layouts/Penitencia';
import { Outro } from './layouts/Outro';
import { Plano360 } from './layouts/Plano360';
import { CamsPantalla } from './layouts/CamsPantalla';
import { GlitchInterrupt } from './gags/GlitchInterrupt';
import { AlertaFalsa } from './gags/AlertaFalsa';
import { SapoRandom } from './gags/SapoRandom';

// Registro de layouts y gags (ver docs/COMPONENT_PATTERNS.md para agregar nuevos).
const LAYOUTS: Record<LayoutId, ComponentType> = {
  'talkshow-grid': TalkshowGrid,
  'plano-general': PlanoGeneral,
  noticiero: Noticiero,
  'brb-bizarro': BrbBizarro,
  intro: Intro,
  tertulia: Tertulia,
  leccion: Leccion,
  ppt: PptHotTopic,
  tema: Tema,
  debate: Debate,
  papeado: Papeado,
  'bum-horizontal': BumHorizontal,
  'bum-vertical': BumVertical,
  penitencia: Penitencia,
  outro: Outro,
  'plano-360': Plano360,
  'cams-pantalla': CamsPantalla,
};

// Layouts donde NO va el bug CH persistente (la Intro ya tiene el logo XL).
const LAYOUTS_SIN_BUG: LayoutId[] = ['intro'];

// El bug va abajo-izquierda por default (no tapa cámaras); en layouts con
// zócalo/marquee/strip inferior se manda arriba a la derecha.
const LAYOUTS_BUG_ARRIBA: LayoutId[] = ['noticiero', 'outro', 'bum-horizontal', 'debate'];

const GAGS: Record<GagId, ComponentType> = {
  'glitch-interrupt': GlitchInterrupt,
  'alerta-falsa': AlertaFalsa,
  'sapo-random': SapoRandom,
};

/**
 * Vista que carga OBS (ruta /). Nunca navega ni recarga: los cambios de
 * layout son estado de Zustand + AnimatePresence. Los gags son capas
 * superpuestas, el layout de abajo nunca se desmonta durante un gag.
 */
export function OverlayApp() {
  const layout = useOverlayStore((s) => s.layout);
  const activeGag = useOverlayStore((s) => s.activeGag);

  useEffect(() => bindOverlaySocket(), []);
  // Solo activo con `?cams=real` (la instancia que corre dentro de OBS).
  useEffect(() => startCamRectReporting(), []);

  const Layout = LAYOUTS[layout];
  const Gag = activeGag ? GAGS[activeGag] : null;

  return (
    <>
      <WobbleFilterDefs />
      <AnimatePresence mode="wait">
        <Layout key={layout} />
      </AnimatePresence>
      {/* Chrome persistente (encima de layouts, debajo de gags) */}
      {!LAYOUTS_SIN_BUG.includes(layout) && (
        <CHBug className={LAYOUTS_BUG_ARRIBA.includes(layout) ? 'ch-bug-wrap--top-right' : ''} />
      )}
      <PhaseBanner />
      <Jukebox />
      <AnimatePresence>{Gag && <Gag key={activeGag} />}</AnimatePresence>
      {/* DirtOverlay desactivado: el blend a pantalla completa costaba
          demasiado en la PC del productor (corre junto a OBS + 5 NDI).
          Ver DESIGN_SYSTEM.md, "Suciedad global". */}
    </>
  );
}
