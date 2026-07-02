import { useEffect, useState } from 'react';
import { emitTrigger, getSocket, DEFAULT_TIMER_MS } from '../socket';
import {
  DEFAULT_TEXTS,
  type LayoutId,
  type GagId,
  type PhaseId,
  type TextKey,
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

const TEXT_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'tema', label: 'Tema' },
  { key: 'zocalo', label: 'Zócalo' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'penitencia', label: 'Penitencia' },
  { key: 'intro-marquee', label: 'Marquee intro' },
  { key: 'brb-sub', label: 'BRB' },
];

const PENITENCIAS_RAPIDAS = ['palomo cojo', 'sardina coja'];

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
            <span className="panel__group-label">TEXTOS EN PANTALLA</span>
            {TEXT_FIELDS.map(({ key, label }) => (
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
            ))}
            <div className="panel__row panel__quick">
              {PENITENCIAS_RAPIDAS.map((p) => (
                <button key={p} className="panel__chip" onClick={() => applyText('penitencia', p)}>
                  {p}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
