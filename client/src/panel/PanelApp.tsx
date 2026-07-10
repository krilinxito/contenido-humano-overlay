import { useEffect, useState } from 'react';
import { emitTrigger, getSocket, resolveMediaUrl, DEFAULT_TIMER_MS, SOCKET_URL } from '../socket';
import {
  DEFAULT_TEXTS,
  DEFAULT_MEDIA,
  PALETTES,
  type LayoutId,
  type GagId,
  type PhaseId,
  type TextKey,
  type MediaPosition,
  type PaletteId,
} from '../store/useOverlayStore';
import { MEMBERS, MEMBER_IDS, type MemberId } from '../config/members';
import { SFX_SOUNDS, MUSIC_TRACKS } from '../config/sounds';
import './PanelApp.css';

// Consola del productor: compacta y práctica (ver docs/ARCHITECTURE.md).
// Al agregar un layout/gag/texto nuevo, sumarlo a estas listas.

const SHOW_LAYOUTS: { id: LayoutId; label: string; emoji: string }[] = [
  { id: 'intro', label: 'Intro', emoji: '🎬' },
  { id: 'tertulia', label: 'Tertulia', emoji: '🗣️' },
  { id: 'tema', label: 'El Tema', emoji: '💡' },
  { id: 'leccion', label: 'Lección', emoji: '🧑‍🏫' },
  { id: 'ppt', label: 'PPT Hot Topic', emoji: '📊' },
  { id: 'debate', label: 'Debate', emoji: '🥊' },
  { id: 'papeado', label: 'Más Papeado', emoji: '🥔' },
  { id: 'bum-horizontal', label: 'BUM Horizontal', emoji: '🎞️' },
  { id: 'bum-vertical', label: 'BUM Vertical', emoji: '📱' },
  { id: 'penitencia', label: 'Penitencia', emoji: '⛓️' },
  { id: 'outro', label: 'Outro', emoji: '👋' },
];

const GENERAL_LAYOUTS: { id: LayoutId; label: string; emoji: string }[] = [
  { id: 'talkshow-grid', label: 'Talkshow Grid', emoji: '📺' },
  { id: 'plano-general', label: 'Plano General', emoji: '🎥' },
  { id: 'plano-360', label: 'Plano 360', emoji: '🔄' },
  { id: 'cams-pantalla', label: 'Cams + Pantalla', emoji: '🖥️' },
  { id: 'noticiero', label: 'Noticiero', emoji: '🗞️' },
  { id: 'brb-bizarro', label: 'Ya Volvemos', emoji: '🌀' },
];

const GAGS: { id: GagId; label: string; emoji: string }[] = [
  { id: 'glitch-interrupt', label: 'Glitch', emoji: '📼' },
  { id: 'alerta-falsa', label: 'Alerta', emoji: '🚨' },
  { id: 'sapo-random', label: 'Sapo', emoji: '🐸' },
];

const PHASES: { id: PhaseId; label: string }[] = [
  { id: 'tertulia', label: 'Tertulia' },
  { id: 'tema', label: 'El Tema' },
  { id: 'leccion', label: 'Lección' },
  { id: 'hot-topics', label: 'Hot Topics PPT' },
  { id: 'debate', label: 'Debate' },
  { id: 'perdedor', label: 'El Más Papeado' },
  { id: 'juego', label: 'Juego' },
  { id: 'bum', label: 'B.U.M.' },
];

// Los de uso frecuente van siempre visibles; el resto agrupado en <details>.
const TEXT_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'tema', label: 'Tema' },
  { key: 'zocalo', label: 'Zócalo' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'penitencia', label: 'Penitencia' },
];

const TEXT_GROUPS: { label: string; fields: { key: TextKey; label: string }[] }[] = [
  {
    label: '👤 Nombres',
    fields: MEMBER_IDS.map((id) => ({ key: `nombre-${id}` as TextKey, label: MEMBERS[id].nombre })),
  },
  {
    label: '🎬 Intro / BRB / Outro',
    fields: [
      { key: 'intro-marquee', label: 'Marquee intro' },
      { key: 'eslogan', label: 'Eslogan' },
      { key: 'brb-title', label: 'BRB título' },
      { key: 'brb-sub', label: 'BRB subtítulo' },
      { key: 'outro-titulo', label: 'Outro título' },
      { key: 'outro-sub', label: 'Outro subtítulo' },
      { key: 'outro-gracias', label: 'Outro gracias' },
      { key: 'outro-marquee', label: 'Outro marquee' },
    ],
  },
  {
    label: '💡 Tema / Lección / PPT',
    fields: [
      { key: 'tema-label', label: 'Cartel tema' },
      { key: 'tema-window', label: 'Ventana tema' },
      { key: 'leccion-label', label: 'Cartel lección' },
      { key: 'ppt-window', label: 'Ventana PPT' },
      { key: 'ppt-timer-label', label: 'Label timer' },
    ],
  },
  {
    label: '🥊 Tertulia / Debate / Papeado / Penitencia',
    fields: [
      { key: 'tertulia-pick', label: '¿Quién empieza?' },
      { key: 'debate-banner', label: 'Banner debate' },
      { key: 'debate-vs', label: 'VS' },
      { key: 'papeado-titulo', label: 'Título papeado' },
      { key: 'papeado-redoble', label: 'Redoble' },
      { key: 'papeado-sello', label: 'Sello' },
      { key: 'papeado-label', label: 'Label penitencia' },
      { key: 'penitencia-pick', label: '¿Quién paga?' },
      { key: 'penitencia-label', label: 'Label cumpliendo' },
      { key: 'penitencia-testigos', label: 'Label testigos' },
    ],
  },
  {
    label: '🪟 Ventanas y varios',
    fields: [
      { key: 'window-chat', label: 'Ventana chat' },
      { key: 'window-set', label: 'Ventana set' },
      { key: 'window-plano-general', label: 'Ventana plano gral.' },
      { key: 'plano360-label', label: 'Cartel 360' },
      { key: 'noticiero-tag', label: 'Tag noticiero' },
    ],
  },
];

const PENITENCIAS_RAPIDAS = ['palomo cojo', 'sardina coja'];

// ---- Memes (sección MEMES, evento `media` — ver docs/EVENTS.md) ----

interface MediaItem {
  name: string;
  url: string;
  kind: 'image' | 'video';
}

/** Para URLs pegadas a mano: extensión de video conocida → video, si no imagen. */
const VIDEO_URL_RE = /\.(mp4|webm|mov|mkv)($|\?)/i;

const MEDIA_POSITIONS: { id: MediaPosition; label: string }[] = [
  { id: 'tl', label: '↖' },
  { id: 'tr', label: '↗' },
  { id: 'center', label: '▣' },
  { id: 'bl', label: '↙' },
  { id: 'br', label: '↘' },
];

/** Consola del productor (ruta /panel). Corre fuera de OBS, puede recargar. */
export function PanelApp() {
  const [connected, setConnected] = useState(false);
  const [lastSent, setLastSent] = useState('—');
  const [layout, setLayout] = useState<LayoutId | null>(null);
  const [member, setMember] = useState<MemberId | null>(null);
  const [phase, setPhase] = useState<PhaseId | ''>('');
  const [bumIndex, setBumIndex] = useState(1);
  const [texts, setTexts] = useState<Record<TextKey, string>>({ ...DEFAULT_TEXTS });
  const [musicTrack, setMusicTrack] = useState<string | null>(null);
  const [musicVol, setMusicVol] = useState(0.5);
  const [palette, setPalette] = useState<PaletteId>('default');
  const [donaNombre, setDonaNombre] = useState('');
  const [donaMonto, setDonaMonto] = useState('');
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaShown, setMediaShown] = useState<string | null>(null);
  const [media, setMedia] = useState({ ...DEFAULT_MEDIA });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setConnected(s.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  const sendLayout = (id: LayoutId) => {
    emitTrigger({ type: 'set-layout', layout: id });
    setLayout(id);
    setLastSent(`escena → ${id}`);
  };

  const sendMember = (m: MemberId | null) => {
    emitTrigger({ type: 'set-member', member: m });
    setMember(m);
    setLastSent(`quién → ${m ?? '—'}`);
  };

  const sendPhase = (p: PhaseId | '') => {
    emitTrigger({ type: 'set-phase', phase: p === '' ? null : p });
    setPhase(p);
    setLastSent(`fase → ${p || 'oculta'}`);
  };

  const sendBum = (i: number) => {
    emitTrigger({ type: 'set-bum-index', index: i });
    setBumIndex(i);
    setLastSent(`bum → video ${i}/5`);
  };

  const sendTimer = (action: 'start' | 'stop', durationMs?: number) => {
    emitTrigger({ type: 'timer', action, durationMs });
    setLastSent(action === 'start' ? `timer → ${(durationMs ?? DEFAULT_TIMER_MS) / 60000}'` : 'timer → stop');
  };

  const sendGag = (g: GagId) => {
    emitTrigger({ type: 'gag', gag: g });
    setLastSent(`gag → ${g}`);
  };

  const sendSfx = (id: string) => {
    emitTrigger({ type: 'sfx', id });
    setLastSent(`sfx → ${id}`);
  };

  const sendMusic = (track: string | null) => {
    if (track) emitTrigger({ type: 'music', action: 'play', track });
    else emitTrigger({ type: 'music', action: 'stop' });
    setMusicTrack(track);
    setLastSent(track ? `música → ${track}` : 'música → stop');
  };

  const sendMusicVolume = (volume: number) => {
    setMusicVol(volume);
    emitTrigger({ type: 'music-volume', volume });
    setLastSent(`música vol → ${Math.round(volume * 100)}%`);
  };

  // Mock de donaciones (botón manual): el sapo anunciador dice el texto.
  // La fuente real (Kicks/Streamlabs) llamará lo mismo desde el server.
  const sendDonacion = () => {
    if (!donaNombre.trim() || !donaMonto.trim()) return;
    emitTrigger({ type: 'gag', gag: 'sapo-random', text: `¡${donaNombre.trim()} tiró ${donaMonto.trim()}!` });
    if (SFX_SOUNDS.some((s) => s.id === 'celebrate')) emitTrigger({ type: 'sfx', id: 'celebrate' });
    setLastSent(`donación → ${donaNombre.trim()} (${donaMonto.trim()})`);
    setDonaNombre('');
    setDonaMonto('');
  };

  const sendPalette = (p: PaletteId) => {
    emitTrigger({ type: 'set-palette', palette: p });
    setPalette(p);
    setLastSent(`paleta → ${p}`);
  };

  // ---- Memes ----

  const refreshGallery = () => {
    fetch(`${SOCKET_URL}/api/media`)
      .then((r) => r.json())
      .then(setGallery)
      .catch(() => setGallery([]));
  };
  useEffect(refreshGallery, []);

  const sendMediaShow = (url: string, kind: 'image' | 'video') => {
    emitTrigger({ type: 'media', action: 'show', url, kind, ...media });
    setMediaShown(url);
    setLastSent(`meme → ${url.split('/').pop()?.slice(0, 30)}`);
  };

  const sendMediaPatch = (patch: Partial<typeof media>) => {
    setMedia((m) => ({ ...m, ...patch }));
    emitTrigger({ type: 'media', action: 'update', ...patch });
  };

  const sendMediaHide = () => {
    emitTrigger({ type: 'media', action: 'hide' });
    setMediaShown(null);
    setLastSent('meme → oculto');
  };

  const deleteMedia = async (item: MediaItem) => {
    // Si el que se borra está al aire, primero se saca de pantalla.
    if (mediaShown === item.url) sendMediaHide();
    try {
      const res = await fetch(`${SOCKET_URL}/api${item.url}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastSent(`meme borrado → ${item.name.slice(0, 30)}`);
    } catch {
      setLastSent('no pude borrar: ¿server caído?');
    }
    refreshGallery();
  };

  const uploadMedia = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${SOCKET_URL}/api/media`, { method: 'POST', body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) {
        setLastSent(`upload falló: ${data.error ?? res.status}`);
        return;
      }
      refreshGallery();
      sendMediaShow(data.url, file.type.startsWith('video/') ? 'video' : 'image');
    } catch {
      setLastSent('upload falló: ¿server caído?');
    } finally {
      setUploading(false);
    }
  };

  const applyText = (key: TextKey, value?: string) => {
    const text = value ?? texts[key];
    if (value !== undefined) setTexts((t) => ({ ...t, [key]: value }));
    emitTrigger({ type: 'set-text', key, text });
    setLastSent(`texto ${key} → "${text.slice(0, 30)}${text.length > 30 ? '…' : ''}"`);
  };

  const resetText = (key: TextKey) => {
    setTexts((t) => ({ ...t, [key]: DEFAULT_TEXTS[key] }));
    emitTrigger({ type: 'set-text', key, text: DEFAULT_TEXTS[key] });
    setLastSent(`texto ${key} → default`);
  };

  // Función render (no componente): un componente definido acá adentro se
  // remonta en cada render y el input pierde el foco al tipear.
  const renderTextRow = (key: TextKey, label: string) => (
    <div key={key} className="panel__text-row">
      <label className="panel__text-label">{label}</label>
      <input
        className="panel__input bevel-in"
        type="text"
        value={texts[key]}
        onChange={(e) => setTexts((t) => ({ ...t, [key]: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') applyText(key);
        }}
      />
      <button className="panel__mini" title="aplicar" onClick={() => applyText(key)}>
        ✓
      </button>
      <button className="panel__mini" title="volver al default" onClick={() => resetText(key)}>
        ↺
      </button>
    </div>
  );

  return (
    <div className="panel">
      <header className="panel__header bevel-out">
        <span className="panel__title">CH · CONSOLA</span>
        <span className={`panel__status ${connected ? 'panel__status--on' : 'panel__status--off'}`}>
          {connected ? '● ON' : '○ SIN SERVER'}
        </span>
        <span className="panel__last">{lastSent}</span>
      </header>

      <div className="panel__body">
        {/* ---- Columna izquierda: escenas ---- */}
        <nav className="panel__scenes bevel-out">
          <div className="panel__scenes-title">ESCENAS</div>
          {SHOW_LAYOUTS.map((l) => (
            <button
              key={l.id}
              className={`panel__scene ${layout === l.id ? 'panel__scene--active' : ''}`}
              onClick={() => sendLayout(l.id)}
            >
              <span className="panel__scene-emoji">{l.emoji}</span> {l.label}
            </button>
          ))}
          <div className="panel__scenes-sep">— generales —</div>
          {GENERAL_LAYOUTS.map((l) => (
            <button
              key={l.id}
              className={`panel__scene ${layout === l.id ? 'panel__scene--active' : ''}`}
              onClick={() => sendLayout(l.id)}
            >
              <span className="panel__scene-emoji">{l.emoji}</span> {l.label}
            </button>
          ))}
        </nav>

        {/* ---- Columna derecha: controles ---- */}
        <main className="panel__controls">
          <section className="panel__group bevel-out">
            <span className="panel__group-label">QUIÉN</span>
            <div className="panel__row">
              {MEMBER_IDS.map((id) => (
                <button
                  key={id}
                  className={`panel__chip ${member === id ? 'panel__chip--active' : ''}`}
                  style={{ background: MEMBERS[id].color }}
                  onClick={() => sendMember(id)}
                >
                  {MEMBERS[id].nombre}
                </button>
              ))}
              <button
                className={`panel__chip ${member === null ? 'panel__chip--active' : ''}`}
                onClick={() => sendMember(null)}
              >
                —
              </button>
            </div>
          </section>

          <div className="panel__group-row">
            <section className="panel__group bevel-out">
              <span className="panel__group-label">FASE</span>
              <div className="panel__row">
                <select
                  className="panel__select bevel-in"
                  value={phase}
                  onChange={(e) => sendPhase(e.target.value as PhaseId | '')}
                >
                  <option value="">(sin banner)</option>
                  {PHASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">BUM · VIDEO</span>
              <div className="panel__row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    className={`panel__chip panel__chip--num ${bumIndex === i ? 'panel__chip--active' : ''}`}
                    onClick={() => sendBum(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">TIMER</span>
              <div className="panel__row">
                <button className="panel__chip panel__chip--timer" onClick={() => sendTimer('start')}>
                  ▶ 5'
                </button>
                <button className="panel__chip panel__chip--timer" onClick={() => sendTimer('start', 60_000)}>
                  ▶ 1'
                </button>
                <button className="panel__chip panel__chip--timer" onClick={() => sendTimer('stop')}>
                  ■
                </button>
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">GAGS</span>
              <div className="panel__row">
                {GAGS.map((g) => (
                  <button key={g.id} className="panel__chip panel__chip--gag" onClick={() => sendGag(g.id)}>
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">DONACIÓN</span>
              <div className="panel__row">
                <input
                  className="panel__input bevel-in panel__input--dona"
                  type="text"
                  placeholder="nombre"
                  value={donaNombre}
                  onChange={(e) => setDonaNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendDonacion()}
                />
                <input
                  className="panel__input bevel-in panel__input--dona"
                  type="text"
                  placeholder="monto"
                  value={donaMonto}
                  onChange={(e) => setDonaMonto(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendDonacion()}
                />
                <button className="panel__chip panel__chip--gag" title="el sapo lo anuncia" onClick={sendDonacion}>
                  🐸 ANUNCIAR
                </button>
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">PALETA</span>
              <div className="panel__row">
                <select
                  className="panel__select bevel-in"
                  value={palette}
                  onChange={(e) => sendPalette(e.target.value as PaletteId)}
                >
                  {PALETTES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </div>

          <div className="panel__group-row">
            <section className="panel__group bevel-out">
              <span className="panel__group-label">SOUNDBOARD</span>
              <div className="panel__row">
                {SFX_SOUNDS.map((s) => (
                  <button key={s.id} className="panel__chip panel__chip--sfx" onClick={() => sendSfx(s.id)}>
                    🔊 {s.label}
                  </button>
                ))}
                {SFX_SOUNDS.length === 0 && (
                  <span className="panel__hint">tirá sfx_*.mp3 en client/src/assets/audio/</span>
                )}
              </div>
            </section>

            <section className="panel__group bevel-out">
              <span className="panel__group-label">MÚSICA</span>
              <div className="panel__row">
                {MUSIC_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    className={`panel__chip ${musicTrack === t.id ? 'panel__chip--active' : ''}`}
                    onClick={() => sendMusic(t.id)}
                  >
                    ♫ {t.label}
                  </button>
                ))}
                {MUSIC_TRACKS.length === 0 && (
                  <span className="panel__hint">tirá music_*.mp3 en client/src/assets/audio/</span>
                )}
                <button className="panel__chip panel__chip--timer" onClick={() => sendMusic(null)}>
                  ■
                </button>
                <input
                  className="panel__slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(musicVol * 100)}
                  title={`volumen ${Math.round(musicVol * 100)}%`}
                  onChange={(e) => sendMusicVolume(Number(e.target.value) / 100)}
                />
              </div>
            </section>
          </div>

          <section className="panel__group bevel-out">
            <span className="panel__group-label">MEMES</span>
            <div className="panel__row">
              <label className={`panel__chip panel__upload ${uploading ? 'panel__upload--busy' : ''}`}>
                📤 {uploading ? 'SUBIENDO…' : 'SUBIR'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadMedia(file);
                    e.target.value = ''; // permite re-subir el mismo archivo
                  }}
                />
              </label>
              <input
                className="panel__input bevel-in"
                type="text"
                placeholder="…o pegá una URL (imagen/video)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mediaUrl.trim())
                    sendMediaShow(mediaUrl.trim(), VIDEO_URL_RE.test(mediaUrl) ? 'video' : 'image');
                }}
              />
              <button
                className="panel__mini"
                title="mostrar URL"
                onClick={() =>
                  mediaUrl.trim() && sendMediaShow(mediaUrl.trim(), VIDEO_URL_RE.test(mediaUrl) ? 'video' : 'image')
                }
              >
                ✓
              </button>
              <button className="panel__chip panel__chip--timer" onClick={sendMediaHide}>
                OCULTAR
              </button>
            </div>
            <div className="panel__row panel__gallery">
              {gallery.map((item) => (
                <div key={item.url} className="panel__thumb-wrap">
                  <button
                    className={`panel__thumb bevel-out ${mediaShown === item.url ? 'panel__thumb--active' : ''}`}
                    title={item.name}
                    onClick={() => sendMediaShow(item.url, item.kind)}
                  >
                    {item.kind === 'image' ? (
                      <img src={resolveMediaUrl(item.url)} alt={item.name} />
                    ) : (
                      <span className="panel__thumb-video">🎞</span>
                    )}
                    <span className="panel__thumb-name">{item.name}</span>
                  </button>
                  <button
                    className="panel__thumb-del"
                    title="borrar del server"
                    onClick={() => void deleteMedia(item)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {gallery.length === 0 && <span className="panel__hint">subí un meme y queda en la galería</span>}
            </div>
            <div className="panel__row">
              {MEDIA_POSITIONS.map((p) => (
                <button
                  key={p.id}
                  className={`panel__chip panel__chip--num ${media.position === p.id ? 'panel__chip--active' : ''}`}
                  title={`posición ${p.id}`}
                  onClick={() => sendMediaPatch({ position: p.id })}
                >
                  {p.label}
                </button>
              ))}
              <label className="panel__slider-label" title="tamaño (% del ancho)">
                📏
                <input
                  className="panel__slider"
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(media.scale * 100)}
                  onChange={(e) => sendMediaPatch({ scale: Number(e.target.value) / 100 })}
                />
              </label>
              <label
                className="panel__slider-label"
                title="opacidad — ojo: <100% sobre un agujero de cámara glitchea el key"
              >
                👻
                <input
                  className="panel__slider"
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(media.opacity * 100)}
                  onChange={(e) => sendMediaPatch({ opacity: Number(e.target.value) / 100 })}
                />
              </label>
              <label className="panel__slider-label" title="volumen (solo video)">
                🔊
                <input
                  className="panel__slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(media.volume * 100)}
                  onChange={(e) => sendMediaPatch({ volume: Number(e.target.value) / 100 })}
                />
              </label>
            </div>
          </section>

          <section className="panel__group bevel-out">
            <span className="panel__group-label">TEXTOS EN PANTALLA</span>
            {TEXT_FIELDS.map(({ key, label }) => renderTextRow(key, label))}
            <div className="panel__row panel__quick">
              {PENITENCIAS_RAPIDAS.map((p) => (
                <button key={p} className="panel__chip" onClick={() => applyText('penitencia', p)}>
                  {p}
                </button>
              ))}
            </div>
            {TEXT_GROUPS.map((group) => (
              <details key={group.label} className="panel__details">
                <summary className="panel__details-summary">{group.label}</summary>
                {group.fields.map(({ key, label }) => renderTextRow(key, label))}
              </details>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
