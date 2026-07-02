# EVENTS.md — Contenido Humano

Contrato de todos los eventos Socket.io. **Cada evento nuevo se documenta acá en el momento de crearlo.**

## Transporte

- Server: `http://localhost:3001` (configurable con env `PORT`).
- El cliente se conecta desde `client/src/socket.ts` (URL configurable con `VITE_SOCKET_URL`).

## Eventos

### `trigger` (Panel → Server)

El panel emite siempre el mismo nombre de evento con un objeto discriminado por `type`:

```ts
type TriggerEvent =
  | { type: 'set-layout'; layout: LayoutId }   // ver LayoutId en useOverlayStore.ts
  | { type: 'gag'; gag: 'glitch-interrupt' | 'alerta-falsa' | 'sapo-random' }
  | { type: 'set-member'; member: MemberId | null }   // 'chavez'|'aym'|'mots'|'darbolis'|'krilin'
  | { type: 'set-phase'; phase: PhaseId | null }
  | { type: 'timer'; action: 'start' | 'stop'; durationMs?: number }
  | { type: 'set-text'; key: TextKey; text: string }
  | { type: 'set-bum-index'; index: number }   // 1..5, se clampea en el store
  | { type: 'sfx'; id: string }                              // soundboard one-shot
  | { type: 'music'; action: 'play' | 'stop'; track?: string }
  | { type: 'music-volume'; volume: number };  // 0..1, se clampea en el store
```

`LayoutId` actual (17): `talkshow-grid | plano-general | noticiero | brb-bizarro | intro | tertulia | leccion | ppt | tema | debate | papeado | bum-horizontal | bum-vertical | penitencia | outro | plano-360 | cams-pantalla`.
`PhaseId`: `tertulia | tema | leccion | hot-topics | debate | perdedor | juego | bum`.

- **Emite**: `PanelApp.tsx` (botones de layout y de gag).
- **Escucha**: `server/index.js`, que lo re-emite tal cual como `overlay-event` a todos los clientes conectados (broadcast, incluido el propio panel — el panel lo ignora).

### `overlay-event` (Server → Overlay)

Mismo payload `TriggerEvent` que `trigger`. El server no transforma nada, solo re-emite.

- **Emite**: `server/index.js`.
- **Escucha**: `bindOverlaySocket()` en `client/src/socket.ts` (llamado una vez desde `OverlayApp`):
  - `set-layout` → `setLayout(layout)`
  - `gag` → `triggerGag(gag)`
  - `set-member` → `setActiveMember(member)` — protagonista de Tertulia, profe de Lección, expositor del PPT
  - `set-phase` → `setPhase(phase)` — muestra/oculta el `PhaseBanner` superior (`null` = oculto)
  - `timer` → `start` llama `startTimer(durationMs ?? DEFAULT_TIMER_MS)` (default 5 min, `DEFAULT_TIMER_MS` en `socket.ts`); `stop` llama `stopTimer()`. Lo renderiza `CountdownTimer` (hoy solo en el layout `ppt`); al expirar queda parpadeando hasta un `stop`.
  - `set-text` → `setText(key, text)` — textos en pantalla editables por el productor. Defaults en `DEFAULT_TEXTS` (`useOverlayStore.ts`). Claves y consumidores:

    | `TextKey` | Lo muestra |
    |---|---|
    | `tema` | Tema (título), Lección (subtítulo), PPT (cartel) |
    | `zocalo` | Noticiero (título del zócalo) |
    | `ticker` | Noticiero (marquee inferior) |
    | `penitencia` | Papeado ("SU PENITENCIA: …", vacío = oculto), Penitencia ("CUMPLIENDO: …") |
    | `intro-marquee` | Intro (marquee inferior) |
    | `brb-sub` | BrbBizarro (subtítulo bajo "YA VOLVEMOS") |

  - `set-bum-index` → `setBumIndex(index)` — cuál de los 5 videos/reels del miembro va en los BUM (el dueño se elige con `set-member`).
  - `sfx` → `playSfx(id)` (`overlay/audio.ts`) — **excepción al patrón**: no pasa por el store porque es un one-shot sin estado visual; el handler lo reproduce directo. Ids/archivos en `config/sounds.ts` (convención `sfx_<id>.mp3`, ver COMPONENT_PATTERNS.md).
  - `music` → `setMusic(track | null)` — track del jukebox en loop (`chrome/Jukebox.tsx`, montado en OverlayApp: sobrevive a los cambios de layout). `play` sin `track` válido o `stop` = silencio.
  - `music-volume` → `setMusicVolume(volume)` — solo afecta a la música; los SFX van siempre a full.

  El audio suena **en el overlay** (dentro de OBS, por el canal del Browser Source) — el panel no reproduce nada. Ojo: cada instancia extra del overlay abierta en un navegador también suena (ver PRODUCCION.md).

### `cam-rects` (Overlay → Server, **no se re-emite**)

Solo lo manda la instancia del overlay que corre con `?cams=real` (la Browser Source de OBS — **una sola**, ver PRODUCCION.md). Reporta dónde quedaron los agujeros de cámara **y de pantalla compartida** del layout actual para que el server posicione las fuentes reales de OBS detrás del overlay (modo cámaras reales, ver ARCHITECTURE.md).

```ts
interface CamRectsPayload {
  layout: LayoutId;
  rects: Array<{
    cam: HoleId; // CamId (MemberId | 'general' | 'noticiero' | 'plano360')
                 // | ScreenId ('screen-<MemberId>' | 'screen-productor')
                 // (client/src/config/cams.ts)
    x: number;   // rect normalizado 0..1 sobre el viewport del overlay
    y: number;
    w: number;
    h: number;
  }>;
}
```

- **Emite**: `startCamRectReporting()` en `client/src/overlay/camRectReporter.ts` (polling 300ms, solo cuando algo cambió más de ~7px).
- **Escucha**: `server/index.js` → valida y llama `applyCamRects()` de `server/obs.js`, que lo traduce a `SetSceneItemTransform` vía obs-websocket. **No** se re-emite como `overlay-event`.

## Duraciones de gags (auto-limpieza en el store, `GAG_DURATIONS_MS`)

| Gag | Duración | Comportamiento |
|---|---|---|
| `glitch-interrupt` | 1600 ms | Distorsión VHS/glitch a pantalla completa; vuelve solo al layout anterior |
| `alerta-falsa` | 3200 ms | Banner BREAKING NEWS con shake/parpadeo |
| `sapo-random` | 4000 ms | Sapo low-poly aparece en posición random, hace algo tonto, se va |

## Convención para agregar un evento nuevo

1. Agregar el nuevo miembro a la unión `TriggerEvent` en `client/src/socket.ts` (tipo compartido entre panel y overlay).
2. El server no cambia (re-emite todo lo que llegue por `trigger`).
3. Manejar el nuevo `type` en `bindOverlaySocket()`.
4. Documentarlo en esta tabla.
