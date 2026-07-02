# Producción — correr el overlay en el stream

La PC del productor corre a la vez: el overlay, OBS y 5 fuentes NDI de las laptops. Todo lo de este doc existe para que eso no se arrastre. Racional de las decisiones de rendimiento del overlay (dpr 1, 24fps, sin blend modes full-screen): ver `DESIGN_SYSTEM.md` y `ARCHITECTURE.md`.

## Correr para el stream (NUNCA el dev server)

```bash
cd client && npm run build     # genera client/dist
cd ../server && node index.js  # sirve overlay + panel + socket en :3001
```

- Overlay para OBS: `http://localhost:3001/` (acepta `?layout=<id>`)
- Panel del productor: `http://localhost:3001/panel`

El dev server de Vite (`npm run dev`, puerto 5173) es **solo para desarrollo**: sirve React sin minificar, corre HMR, y su `StrictMode` monta todo dos veces — incluidos los contextos WebGL. En el stream siempre la versión buildeada desde el server.

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
- El autoplay funciona solo dentro de OBS; si probás el overlay en un navegador normal, hacé un click en la página antes o el navegador bloquea el audio.

## Checklist de NDI (las 5 laptops)

- Si las laptops lo soportan, emitir en **NDI HX** (comprimido por hardware) en vez de NDI full: NDI full a 1080p son ~125 Mbps *por laptop*; 5 fuentes saturan red y CPU de recepción.
- Todo por **cable gigabit** al mismo switch. Nunca WiFi — ni una sola de las cinco.
- Si igual falta CPU: bajar las fuentes NDI a 720p en origen (en cámara ampliada casi no se nota; la grilla de 5 seguro que no).
