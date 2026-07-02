// Cámaras físicas del estudio: las 5 de la plebe + las tomas especiales.
// El server mapea cada CamId a una fuente real de OBS en `server/obs-config.json`
// (varias pueden apuntar a la misma fuente física, p. ej. la cam ancha).
import type { MemberId } from './members';

export type CamId = MemberId | 'general' | 'noticiero' | 'plano360';
