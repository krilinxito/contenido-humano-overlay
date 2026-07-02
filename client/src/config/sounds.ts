// Sonidos del show, auto-descubiertos de client/src/assets/audio/ por prefijo:
//   sfx_<id>.mp3   → efecto del soundboard (one-shot)
//   music_<id>.mp3 → track del jukebox (loop)
// Agregar un sonido = tirar el mp3 con el prefijo correcto en esa carpeta;
// aparece solo como botón en el panel (ver docs/COMPONENT_PATTERNS.md).
// Los reproduce SIEMPRE el overlay (dentro de OBS), nunca el panel — ver
// docs/ARCHITECTURE.md, "Audio (soundboard + jukebox)".

const FILES = import.meta.glob<string>('../assets/audio/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

export interface SoundDef {
  id: string;
  /** id legible para el botón del panel (guiones/underscores → espacios). */
  label: string;
  url: string;
}

function collect(prefix: 'sfx' | 'music'): SoundDef[] {
  return Object.entries(FILES)
    .flatMap(([path, url]) => {
      const name = path.split('/').pop()!.replace(/\.mp3$/, '');
      if (!name.startsWith(`${prefix}_`)) return [];
      const id = name.slice(prefix.length + 1);
      return [{ id, label: id.replace(/[-_]+/g, ' '), url }];
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const SFX_SOUNDS = collect('sfx');
export const MUSIC_TRACKS = collect('music');
