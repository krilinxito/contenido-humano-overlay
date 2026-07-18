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
  | { type: 'gag'; gag: 'glitch-interrupt' | 'alerta-falsa' | 'sapo-random'; text?: string }
  | { type: 'set-member'; member: MemberId | null }   // 'chavez'|'aym'|'mots'|'darbolis'|'krilin'
  | { type: 'set-phase'; phase: PhaseId | null }
  | { type: 'timer'; action: 'start' | 'stop'; durationMs?: number }
  | { type: 'set-text'; key: TextKey; text: string }
  | { type: 'set-bum-index'; index: number }   // 1..5, se clampea en el store
  | { type: 'sfx'; id: string }                              // soundboard one-shot
  | { type: 'music'; action: 'play' | 'stop'; track?: string }
  | { type: 'music-volume'; volume: number }   // 0..1, se clampea en el store
  | { type: 'media'; action: 'show' | 'update' | 'hide';   // meme en pantalla
      url?: string; kind?: 'image' | 'video';  // requeridos en show
      scale?: number; opacity?: number; volume?: number;   // 0..1
      position?: 'center' | 'tl' | 'tr' | 'bl' | 'br' }
  | { type: 'set-palette'; palette: 'default' | 'vaporwave' | 'xp-luna' | 'crt' }
  | { type: 'chat-overlay'; visible: boolean }   // chat de Kick flotante sobre el overlay (botón CHAT)
  | { type: 'chat-message'; user: string; msg: string; color?: string }  // NACE EN EL SERVER (kick.js), el panel no lo emite
  | { type: 'follow'; user?: string };           // NACE EN EL SERVER (kick.js): seguidor nuevo en Kick
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
  - `gag` → `triggerGag(gag, text?)` — con `text` (hoy solo lo usa el sapo) el gag lo dice en su burbuja en vez de su contenido random y dura `SAPO_TEXT_DURATION_MS` (6s). Es el **sapo anunciador de donaciones**: el mini-form DONACIÓN del panel manda `¡<nombre> tiró <monto>!` (+ sfx `celebrate` si existe). Mock a propósito — cuando se enchufe la fuente real (Kicks/Streamlabs, a definir) el server emitirá este mismo evento.
  - `set-member` → `setActiveMember(member)` — protagonista de Tertulia, profe de Lección, expositor del PPT
  - `set-phase` → `setPhase(phase)` — muestra/oculta el `PhaseBanner` superior (`null` = oculto)
  - `timer` → `start` llama `startTimer(durationMs ?? DEFAULT_TIMER_MS)` (default 5 min, `DEFAULT_TIMER_MS` en `socket.ts`); `stop` llama `stopTimer()`. Lo renderiza `CountdownTimer` (hoy solo en el layout `ppt`); al expirar queda parpadeando hasta un `stop`.
  - `set-text` → `setText(key, text)` — textos en pantalla editables por el productor. Defaults en `DEFAULT_TEXTS` (`useOverlayStore.ts`). Criterio: TODO texto visible en el stream es editable; quedan afuera labels de placeholders (en stream los tapa la cam real) y utilería fija de chiste (personas del TalkshowGrid, créditos extra del Outro). Claves y consumidores:

    | `TextKey` | Lo muestra |
    |---|---|
    | `tema` | Tema (título), Lección (subtítulo), PPT (cartel) |
    | `eslogan` | CHBug (marquee), Intro, Outro, cortinilla Kazaa |
    | `window-chat` / `window-set` / `window-plano-general` | Títulos de XPWindow del chat (Intro, PlanoGeneral, ChatOverlay flotante), de la ventana del set (Tertulia, Debate, Papeado, Penitencia, cam general del PPT) y del plano general |
    | `plano360-label` | Plano360 (cartel parpadeante) |
    | `zocalo` / `ticker` / `noticiero-tag` | Noticiero (título del zócalo, marquee inferior, tag "EN VIVO") |
    | `intro-marquee` | Intro (marquee inferior) |
    | `brb-title` / `brb-sub` | BrbBizarro (título + subtítulo) |
    | `outro-titulo` / `outro-sub` / `outro-gracias` / `outro-marquee` | Outro (créditos) |
    | `tema-label` / `tema-window` | Tema (cartel "EL TEMA DE HOY:", título de ventana) |
    | `leccion-label` | Lección (cartel) |
    | `ppt-window` / `ppt-timer-label` | PPT (título de ventana, label del countdown) |
    | `tertulia-pick` / `penitencia-pick` | Tertulia "¿QUIÉN EMPIEZA?" / Penitencia "¿QUIÉN PAGA?" |
    | `debate-banner` / `debate-vs` | Debate (banner y "VS") |
    | `papeado-titulo` / `papeado-redoble` / `papeado-sello` / `papeado-label` | Papeado (título, redoble, sello, label "SU PENITENCIA:") |
    | `penitencia` | Papeado (texto de la penitencia, vacío = oculto), Penitencia ("CUMPLIENDO: …") |
    | `penitencia-label` / `penitencia-testigos` | Penitencia (label "CUMPLIENDO:", label del strip de testigos) |
    | `nombre-<member>` | Nombre en pantalla del miembro — nametags (`CamCell`), badges (`MemberBadge`), créditos del Outro y títulos de ventana derivados. Helper `getMemberName(texts, id)` en `useOverlayStore.ts` |

  - `set-bum-index` → `setBumIndex(index)` — cuál de los 5 videos/reels del miembro va en los BUM (el dueño se elige con `set-member`).
  - `sfx` → `playSfx(id)` (`overlay/audio.ts`) — **excepción al patrón**: no pasa por el store porque es un one-shot sin estado visual; el handler lo reproduce directo. Ids/archivos en `config/sounds.ts` (convención `sfx_<id>.mp3`, ver COMPONENT_PATTERNS.md).
  - `music` → `setMusic(track | null)` — track del jukebox en loop (`chrome/Jukebox.tsx`, montado en OverlayApp: sobrevive a los cambios de layout). `play` sin `track` válido o `stop` = silencio.
  - `music-volume` → `setMusicVolume(volume)` — solo afecta a la música; los SFX van siempre a full.
  - `set-palette` → `setPalette(palette)` — re-tematiza el overlay en vivo: OverlayApp aplica `data-palette` en `<html>` y los tokens CSS se overridean (`styles/themes.css`). Paletas y límites en DESIGN_SYSTEM.md, sección "Paletas".
  - `media` → `showMedia` / `updateMedia` / `hideMedia` — meme (imagen/video) sobre el overlay, lo renderiza `chrome/MediaLayer.tsx` (montado en OverlayApp: sobrevive a los cambios de layout; encima del chrome, debajo de gags). `show` requiere `url` + `kind` (lo demás toma `DEFAULT_MEDIA`); `update` ajusta tamaño/opacidad/volumen/posición en vivo; `hide` lo saca. Las URLs relativas (`/media/…`) se resuelven contra el server (`resolveMediaUrl` en `socket.ts`). **Ojo**: `opacity < 1` sobre un agujero magenta se keyea a medias — decisión del productor. Los archivos se suben por HTTP (fuera de Socket.io): `POST /api/media` (multipart, campo `file`, solo imagen/video, máx 100 MB) responde `{ url }`; `GET /api/media` lista la galería (`server/uploads/`, gitignoreado, servido en `/media/*`); `DELETE /api/media/<archivo>` lo borra del server (el panel primero lo saca de pantalla si estaba al aire). Autoplay de videos: dentro de OBS siempre anda; en un navegador normal el `play()` con sonido se bloquea sin click previo — `MediaLayer` cae a reproducir muteado.

  - `chat-overlay` → `setChatOverlay(visible)` — muestra/oculta el chat de Kick flotante sobre cualquier layout (`chrome/ChatOverlay.tsx`, montado en OverlayApp: sobrevive a los cambios de layout; z 60 — encima del chrome, debajo de memes y gags). Lo dispara el botón CHAT del panel.

  - `chat-message` → `pushChatMessage({ user, msg, color? })` — mensaje real del chat de Kick. **Excepción al flujo**: nace en el **server** (`server/kick.js`, websocket Pusher de Kick) y no en el panel; se broadcastea con la misma forma `overlay-event`. El store retiene los últimos `CHAT_BUFFER_SIZE` (15) en `chatMessages`; `FakeChat` los muestra, y si nunca llegó ninguno cae a sus mensajes falsos (dev sin `kick-config.json` se ve igual). `color` es el color de nick de la identidad de Kick. Config y checklist en PRODUCCION.md.

  - `follow` → seguidor nuevo del canal de Kick. También nace en el **server** (`kick.js` escucha `App\Events\FollowersUpdated` en `channel.<channelId>` y filtra: solo `followed: true` con el contador subiendo). El handler no toca el store: dispara el **sapo anunciador** (`triggerGag('sapo-random', ...)`) con `¡<user> ahora sigue el canal!` (o texto genérico si Kick no mandó username) + sfx `follow` si existe, con fallback a `celebrate`. Config del `channelId` en PRODUCCION.md.

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
| `sapo-random` | 4000 ms (6000 ms con `text`) | Sapo low-poly aparece en posición random, hace algo tonto, se va. Con `text` (donaciones) lo dice en la burbuja |

## Convención para agregar un evento nuevo

1. Agregar el nuevo miembro a la unión `TriggerEvent` en `client/src/socket.ts` (tipo compartido entre panel y overlay).
2. El server no cambia (re-emite todo lo que llegue por `trigger`).
3. Manejar el nuevo `type` en `bindOverlaySocket()`.
4. Documentarlo en esta tabla.
