# ARCHITECTURE.md — Contenido Humano

## Estructura

```
layout_plebe/
├── server/            # Express + Socket.io (puerto 3001)
│   ├── index.js       # recibe "trigger" → broadcast "overlay-event"; "cam-rects" → obs.js
│   ├── obs.js         # ÚNICO lugar que habla obs-websocket (cámaras reales)
│   └── obs-config.json # url/password del websocket de OBS + mapa cam → fuente
├── client/            # Vite + React + TS (puerto 5173)
│   └── src/
│       ├── main.tsx               # decide OverlayApp vs PanelApp por pathname (SIN router)
│       ├── overlay/
│       │   ├── OverlayApp.tsx     # vista de OBS (ruta /)
│       │   ├── motionPresets.ts   # presets de Framer Motion (ver DESIGN_SYSTEM.md)
│       │   ├── layouts/           # TalkshowGrid, PlanoGeneral, Noticiero, BrbBizarro
│       │   ├── gags/              # GlitchInterrupt, AlertaFalsa, SapoRandom
│       │   └── chrome/            # XPWindow, CamPlaceholder, Scanlines, WobbleFilterDefs, MarqueeText
│       ├── panel/PanelApp.tsx     # vista del productor (ruta /panel)
│       ├── three/LowPolyScene.tsx # escena 3D compartida
│       ├── store/useOverlayStore.ts
│       ├── socket.ts
│       └── styles/                # tokens.css + retro-utils.css
└── docs/
```

## Por qué client/server separados

El overlay corre dentro de OBS (Browser Source) y el panel en el navegador del productor, posiblemente en otra máquina. El server Socket.io es el único punto de encuentro: el panel nunca habla directo con el overlay.

## Por qué NO hay React Router en el overlay

La ruta `/` vive en OBS y **no puede recargar ni navegar** (una navegación real parpadea la fuente en vivo). El layout activo es estado de Zustand; los cambios de layout son re-renders animados con `AnimatePresence`, no navegación. `main.tsx` solo mira `window.location.pathname` una vez al arrancar para decidir si monta `OverlayApp` (`/`) o `PanelApp` (`/panel`). `/panel` sí puede recargar porque corre fuera de OBS.

## Modo híbrido OBS (escenas + socket)

Las transiciones entre escenas del programa las maneja **OBS**: cada escena de OBS tiene su propio Browser Source apuntando a `/?layout=<id>` (ej. `http://localhost:5173/?layout=leccion`). El query param se lee **una sola vez** al arrancar (`initialLayoutFromUrl()` en `useOverlayStore.ts`) y fija el layout inicial — sin navegación.

```
Escena OBS "Lección"  → Browser Source /?layout=leccion
Escena OBS "PPT"      → Browser Source /?layout=ppt
   (transición de escena = transición de OBS)

Panel → socket → TODAS las instancias del overlay a la vez:
   set-member / set-phase / timer / gags  (datos dinámicos, llegan a cada escena)
   set-layout (útil para testear en un browser sin OBS)
```

Consecuencia: `set-layout` por socket también le llega a los Browser Sources de OBS y les cambia el layout internamente. Para operar con escenas OBS, usar el panel solo para lo dinámico y dejar los cambios de layout a OBS; `set-layout` es la vía de testeo sin OBS.

## Cámaras reales (modo `?cams=real` + obs-websocket)

Objetivo: que las cámaras se vean **dentro** de los marcos del overlay, con el fondo del layout alrededor y elementos por encima, usando **una sola Browser Source** (se evaluó el sándwich de dos sources — fondo / cámaras / marcos — y se rechazó por duplicar instancias del overlay).

**Cómo funciona:**

1. En OBS las 5-6 fuentes de cámara van **debajo** del Browser Source del overlay, en la misma escena.
2. El Browser Source carga el overlay con `?cams=real`. En ese modo cada `CamPlaceholder` con prop `cam` no dibuja su patrón: se pinta del **magenta llave** `--obs-key-magenta` (`#FF00FF`, reservado en tokens.css).
3. Un filtro **Color Key** sobre el Browser Source vuelve transparente ese magenta exacto → la cámara de abajo se ve a través del agujero. Todo lo demás del overlay queda opaco por encima.
4. `camRectReporter.ts` mide los agujeros (`getBoundingClientRect`, normalizado 0..1) y manda `cam-rects` al server cuando cambian (ver EVENTS.md).
5. `server/obs.js` los traduce a `SetSceneItemTransform` (bounds `SCALE_OUTER` = cover, anclado arriba-izquierda): las cámaras saltan a la posición de su agujero en cada cambio de layout.

**Decisiones y límites (importantes):**

- **Por qué color key y no transparencia real**: un agujero con alpha CSS no perfora los fondos de los ancestros (el degradado full-screen del layout pinta detrás de la ventana); perforarlos exigiría enmascarar dinámicamente el fondo de cada layout. El color key lo resuelve sin tocar ningún fondo existente.
- Las cámaras **nunca se ocultan** con `SetSceneItemEnabled`: cuando un layout no las muestra, el overlay opaco las tapa. Así no parpadean al cambiar de layout.
- Los transforms van con `cropToBounds: true` (OBS 30.2+): sin eso, el desborde del modo cover se ve a través de los agujeros **vecinos** (el overlay tapa el desborde, pero los otros marcos también son transparentes).
- Los transforms de OBS son **saltos secos**, no animaciones: durante la entrada animada de un layout la cámara puede quedar ~300ms desalineada hasta que el reporter re-mide. El marco grueso lo disimula.
- Nada **semitransparente** debe pintarse sobre un agujero magenta (se keyea a medias y queda glitchoso). Elementos opacos (stickers, doodles, badges) pasan por encima sin problema.
- `?cams=real` va en **una sola** Browser Source. Con el modo híbrido de escenas (varias sources con `?layout=`), las instancias reportarían rects contradictorios. Para cámaras reales la operación recomendada es **escena única** + cambios de layout desde el panel (`set-layout`).
- La integración obs-websocket vive **solo en `server/obs.js`** — el overlay únicamente reporta rects; el client jamás importa obs-websocket-js.
- Cams especiales (`general`, `noticiero`, `plano360`) se mapean a fuentes reales en `server/obs-config.json`; varias pueden apuntar a la misma fuente física.

**Pantallas compartidas (`screen-*`):**

El mismo mecanismo cubre las pantallas: `obs.js` es **agnóstico al tipo de fuente** (solo hace `GetSceneItemId` por nombre + `SetSceneItemTransform`), así que da igual que la fuente sea una webcam USB, una **NDI** (pantalla de un miembro remoto) o una **captura de ventana** (pantalla del productor en la PC del stream). No se declara el tipo en ningún lado: solo el nombre de la source en `obs-config.json`.

- Ids: `screen-chavez` … `screen-krilin` (NDI de cada miembro) + `screen-productor` (`ScreenId` en `client/src/config/cams.ts`; `HoleId = CamId | ScreenId` es lo que viaja en `cam-rects`).
- `ScreenPlaceholder` acepta prop `screen?: ScreenId` y en `?cams=real` se vuelve agujero magenta, igual que `CamPlaceholder`. Los layouts con pantalla (Lección, CamsPantalla, PPT) derivan el id de `activeMember` (fallback `screen-productor`); Tema usa `screen-productor` fijo. Cambiar quién comparte = `set-member` desde el panel, sin tocar OBS.
- **Fit, no cover**: los ids listados en `"fit"` de `obs-config.json` usan `OBS_BOUNDS_SCALE_INNER` (se ve todo el contenido; recortar una PPT se come texto). Si el aspecto no coincide queda franja — conviene una source de color sólido justo debajo de las pantallas en OBS. Las cams siguen con cover.
- **Excepción a "nunca se ocultan"**: las 6 sources de pantalla comparten **el mismo agujero**, así que la anterior taparía a la nueva según el z-order. Las `screen-*` ausentes del payload se **estacionan fuera del canvas** (transform con `positionX` fuera de pantalla — sin `SetSceneItemEnabled`). El costo es el mismo salto seco de ~300ms ya aceptado en transiciones.

## Audio (soundboard + jukebox)

El audio del show lo reproduce **el overlay dentro de OBS**, nunca el panel: el audio de un Browser Source entra directo al mezclador de OBS, mientras que el panel corre en el navegador del productor (posiblemente en otra máquina) y sonaría ahí. El flujo es el estándar: panel → `sfx`/`music`/`music-volume` → overlay.

- SFX: one-shots vía `playSfx()` (`overlay/audio.ts`), llamado directo desde `bindOverlaySocket` — no pasan por el store porque no son estado visual.
- Música: sí es estado (`musicTrack`/`musicVolume` en el store); la reproduce `chrome/Jukebox.tsx` (headless, montado en OverlayApp) en loop — sobrevive a los cambios de layout.
- Archivos auto-descubiertos de `client/src/assets/audio/` por prefijo `sfx_`/`music_` (`config/sounds.ts`, ver COMPONENT_PATTERNS.md).
- Límite conocido: música y SFX comparten el canal del Browser Source en el mezclador de OBS; el volumen fino de la música se controla desde el panel. Si algún día se necesita ducking en OBS, habría que separar la música en otra fuente.

## Flujo de eventos

```
PanelApp (botón)
  → socket.emit('trigger', { type, payload })     [client/src/socket.ts]
  → server recibe 'trigger' y hace io.emit('overlay-event', evento)   [server/index.js]
  → OverlayApp escucha 'overlay-event' (bindOverlaySocket en socket.ts)
  → despacha al store Zustand (setLayout / triggerGag)
  → los componentes suscriptos re-renderizan con AnimatePresence
```

Los gags se auto-limpian: `triggerGag` setea `activeGag` y un `setTimeout` con la duración del gag (definida en `GAG_DURATIONS_MS` en el store) lo vuelve a `null`. El layout anterior nunca se pierde porque los gags son capas superpuestas, no reemplazos de layout.

Ver `docs/EVENTS.md` para el contrato exacto de cada evento.

## Estado (Zustand — `useOverlayStore.ts`)

- `layout: LayoutId` — layout activo (8 layouts; inicial desde `?layout=` o `talkshow-grid`)
- `activeGag: GagId | null` — gag en curso (uno a la vez; un gag nuevo pisa al anterior y resetea su timer)
- `activeMember: MemberId | null` — protagonista actual (tertulia/lección/ppt); datos de miembros en `client/src/config/members.ts`
- `phase: PhaseId | null` — fase del rundown para el `PhaseBanner` superior
- `timerEndsAt: number | null` — fin del countdown (epoch ms); lo consume `CountdownTimer`
- `texts: Record<TextKey, string>` — textos en pantalla editables por el productor (`set-text`); defaults en `DEFAULT_TEXTS`. Tabla de claves en `docs/EVENTS.md`
- `bumIndex: number` — cuál de los 5 videos del miembro va en los BUM (1..5)
- Acciones: `setLayout`, `triggerGag`, `clearGag`, `setActiveMember`, `setPhase`, `startTimer`, `stopTimer`
- La integración con OBS (obs-websocket) NO vive acá: está en `server/obs.js` (ver "Cámaras reales"). El client no sabe de OBS; solo reporta rects.

## Chrome persistente (montado por OverlayApp sobre cualquier layout)

- `CHBug` — logo CH + eslogan, **abajo a la izquierda** (para no tapar cámaras) en todos los layouts salvo `LAYOUTS_SIN_BUG` (hoy: `intro`, que ya tiene el logo XL). En layouts con zócalo inferior (`LAYOUTS_BUG_ARRIBA`, hoy: `noticiero`) va arriba a la derecha.
- `PhaseBanner` — fase actual del programa, esquina superior izquierda, visible solo si `phase !== null`.
- Capas (z-index): layout (0) → chrome persistente (50) → gags (100) → scanlines del layout (200).

## Layouts (17, todos implementados)

- **Rundown del programa**: `intro`, `tertulia`, `tema`, `leccion`, `ppt`, `debate`, `papeado`, `bum-horizontal`, `bum-vertical`, `penitencia`, `outro`.
- **Generales**: `talkshow-grid`, `plano-general`, `plano-360`, `cams-pantalla`, `noticiero`, `brb-bizarro`.
- `tema`, `leccion` y `cams-pantalla` reusan la composición `ScreenPlusCams`; las celdas de cam individuales son `CamCell` (chrome).
- La fase "juego" del rundown no tiene layout propio: usa los layouts existentes + el `PhaseBanner` con `set-phase: juego`.

## Lo que NO se debe hacer

- **No** usar `localStorage` / `sessionStorage` en ningún componente.
- **No** navegar de verdad en `/` (nada de `history.pushState`, links, ni React Router).
- **No** meter lógica de OBS fuera de `server/obs.js` (el client nunca importa obs-websocket-js; solo reporta `cam-rects`). NDI/hardware siguen fuera del proyecto.
- **No** usar `--obs-key-magenta` (`#FF00FF`) en ningún diseño: es el color llave del Color Key (ver "Cámaras reales").
- **No** conectar el panel directo al overlay: todo pasa por el server.
- **No** definir estilos con colores/fuentes fuera de `tokens.css` (ver DESIGN_SYSTEM.md).
- **No** usar `<Canvas>` de R3F directo: siempre `RetroCanvas` (`three/RetroCanvas.tsx`), que fija `dpr=1`, muestreo a ~24fps y `offsetSize`. Presupuesto de contextos WebGL por layout: 1 fila/columna (`AvatarRow`/`AvatarColumn`) + 1 busto individual + 1 gag transitorio, máximo.
- **No** aplicar filtros CSS (`filter: url(...)`, `.sticker`, `blur`) sobre un elemento animado con transform ni sobre un subtree que contenga un Canvas vivo — se re-rasterizan en cada frame (ver DESIGN_SYSTEM.md, "Filtros y rendimiento").
- **No** intentar un Canvas compartido persistente entre layouts (portals/scissor): se evaluó y se rechazó — si ese contexto único se pierde, TODOS los avatares quedan en negro en vivo. El costo de remontar primitivas en cada cambio de layout es despreciable.
- **No** agregar capas a pantalla completa con `mix-blend-mode` ni animaciones que repinten el viewport entero: la PC de producción corre el overlay junto a OBS + 5 NDI. Por eso `DirtOverlay` y las scanlines están desactivados (ver DESIGN_SYSTEM.md, "Suciedad global").
