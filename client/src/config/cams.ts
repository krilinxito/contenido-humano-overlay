// Cámaras físicas del estudio: las 5 de la plebe + las tomas especiales.
// El server mapea cada CamId a una fuente real de OBS en `server/obs-config.json`
// (varias pueden apuntar a la misma fuente física, p. ej. la cam ancha).
import type { MemberId } from './members';

export type CamId = MemberId | 'general' | 'noticiero' | 'plano360';

// Pantallas compartidas: la NDI de cada miembro + la ventana del productor
// (captura en la PC del stream) + la pantalla que reproduce los videos de los
// BUM (`screen-bum`, qué fuente es se decide en obs-config.json). Comparten el
// mecanismo de agujeros de las cams — obs.js es agnóstico al tipo de fuente
// (USB/NDI/captura de ventana).
export type ScreenId = `screen-${MemberId}` | 'screen-productor' | 'screen-bum';

/** Cualquier agujero magenta reportable en `cam-rects`. */
export type HoleId = CamId | ScreenId;
