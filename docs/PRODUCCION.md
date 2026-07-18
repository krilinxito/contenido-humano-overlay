# Producción — correr el overlay en el stream

La PC del productor corre a la vez: el overlay, OBS y 5 fuentes NDI de las laptops. Todo lo de este doc existe para que eso no se arrastre. Racional de las decisiones de rendimiento del overlay (dpr 1, 24fps, sin blend modes full-screen): ver `DESIGN_SYSTEM.md` y `ARCHITECTURE.md`.

## Correr para el stream (NUNCA el dev server)

```bash
cd client && npm run build     # genera client/dist
cd ../server && node index.js  # sirve overlay + panel + socket en :3001
```

- Overlay para OBS: `http://localhost:3001/` (acepta `?layout=<id>`)
- Panel del productor: `http://localhost:3001/panel`

El dev server de Vite (`npm run dev`, puerto 5173) es **solo para desarrollo**: sirve React sin minificar y corre HMR. Para juzgar **rendimiento** (fluidez, GPU) siempre usar el build servido por Express en `http://localhost:3001/` — es lo que corre en el stream; el dev server siempre va a ir más pesado. (Nota: el proyecto no usa `StrictMode` a propósito — en dev duplicaba todos los contextos WebGL, ver `client/src/main.tsx`.)

## Checklist de OBS

- Browser source del overlay: **1920×1080, FPS 30** (no 60 — el 3D del overlay muestrea a 24fps igual, ver DESIGN_SYSTEM.md).
- **Desmarcar** "Shutdown source when not visible" y "Refresh browser when scene becomes active": si OBS mata/recarga la source en cada cambio de escena, se reconstruyen los contextos WebGL cada vez.
- Para escenas con layout fijo, usar `http://localhost:3001/?layout=<id>` como URL inicial de la source.
- Encoder de salida: **por hardware** (NVENC / QuickSync / AMF), nunca x264 por software — compite por CPU con el navegador y los NDI.

## Cámaras reales dentro de los marcos (modo `?cams=real`)

Racional y límites en `ARCHITECTURE.md` ("Cámaras reales"). Setup:

1. **OBS → Herramientas → Ajustes del servidor WebSocket**: activarlo (puerto 4455 default) y copiar la contraseña a `server/obs-config.json` (o pasarla por env: `OBS_WS_PASSWORD=... node index.js`; también existen `OBS_WS_URL` y `OBS_SCENE`).
2. Una **escena única** (default: `PROGRAMA`, configurable en `obs-config.json`) con:
   - Las fuentes de cámara (NDI) **abajo**, con los nombres exactos del mapa `sources` de `obs-config.json` (`CAM Chavez`, `CAM Aym`, …, `CAM General`).
   - El Browser Source del overlay **arriba de todas**, URL `http://localhost:3001/?cams=real`.
3. Al Browser Source: **Filtros → Color Key** (Efecto): tipo de color **Magenta**, similitud ~80-120, suavidad baja. Eso vuelve transparentes los agujeros `#FF00FF` del overlay.
4. `?cams=real` va en **esa única** Browser Source, en ninguna otra instancia (ni el panel ni pestañas de prueba). Con cámaras reales NO usar el modo híbrido de varias escenas con `?layout=`: los cambios de layout se disparan desde el panel.
5. El server loguea al conectar: `[obs] conectado a ws://... — escena "PROGRAMA", N cámaras resueltas`. Si una fuente no aparece (`no está en la escena`), revisar el nombre exacto en OBS vs `obs-config.json`.

Prueba rápida sin salir al aire: con OBS y el server corriendo, cambiar layouts desde el panel y verificar que las cámaras saltan a sus marcos (~0.3s después de cada cambio, es esperado).

## Audio del overlay (soundboard + música)

- Por el Browser Source del overlay sale TODO el audio del show que dispara el panel (SFX + música). Por default suena por los parlantes de la PC y entra al stream vía "Audio del escritorio"; **recomendado**: activar "Controlar el audio desde OBS" en las propiedades de la fuente para que aparezca como canal propio **"Overlay"** en el mezclador (nivel independiente, y no depende del audio del escritorio ni suena por los parlantes salvo que actives monitoreo). El volumen fino de la música se maneja con el slider del panel.
- **No abrir el overlay (`/` con o sin `?cams=real`) en ningún otro navegador durante el show**: cada instancia extra reproduce el audio también (doble bocina). El panel no suena.
- El autoplay con sonido funciona solo dentro de OBS. En un navegador normal el audio queda bloqueado hasta el **primer click/tecla en la página**: al primer gesto, la música y los videos de memes (que arrancan muteados) recuperan el sonido solos (`retryOnFirstInteraction`, `overlay/audio.ts`). Los SFX one-shot bloqueados no se recuperan (reproducirlos tarde sería peor) — disparalos de nuevo después del click.

## Chat real de Kick

- Copiar `server/kick-config.example.json` → `server/kick-config.json` (gitignoreado) y poner `"enabled": true` + `"channel": "<slug del canal>"` (el slug es lo que va en la URL `kick.com/<slug>`).
- El server se conecta **solo lectura, sin cuenta ni token** al websocket público de Kick y re-emite cada mensaje como `chat-message` (ver EVENTS.md); lo muestran los chats de Intro y Plano General, y el botón **CHAT** del panel lo superpone flotante sobre cualquier layout (evento `chat-overlay`). Sin config o con Kick caído, el overlay cae a los mensajes falsos de siempre — nunca rompe el show.
- Si en el log aparece `no pude resolver el canal` (Cloudflare a veces bloquea la API server-side): abrir `kick.com/api/v2/channels/<slug>` en un navegador, copiar el `chatroom.id` del JSON y ponerlo como `"chatroomId"` en el json, y el `id` de la raíz del mismo JSON como `"channelId"`.
- **Avisos de follow**: el server también escucha `channel.<channelId>` y ante cada seguidor nuevo dispara el sapo anunciador + sonido (evento `follow`, ver EVENTS.md). Necesita el `channelId` (lo resuelve de la API, o manual en el json); sin él el chat anda igual y solo se apagan los avisos (queda logueado `avisos de follow apagados`). El sonido es `sfx_follow.mp3` si existe en `client/src/assets/audio/`; si no, cae a `sfx_celebrate.mp3`.
- Verificación pre-show: mandar un mensaje en el chat de Kick y verlo aparecer en el overlay (botón CHAT del panel o layout Intro / Plano General); seguir el canal con una cuenta de prueba y ver salir al sapo con sonido.

## Checklist de NDI (las 5 laptops)

- Si las laptops lo soportan, emitir en **NDI HX** (comprimido por hardware) en vez de NDI full: NDI full a 1080p son ~125 Mbps *por laptop*; 5 fuentes saturan red y CPU de recepción.
- Todo por **cable gigabit** al mismo switch. Nunca WiFi — ni una sola de las cinco.
- Si igual falta CPU: bajar las fuentes NDI a 720p en origen (en cámara ampliada casi no se nota; la grilla de 5 seguro que no).
