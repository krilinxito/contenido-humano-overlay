# Contenido Humano — Overlay OBS

Overlay para OBS Studio de un talkshow/podcast en vivo con 5 integrantes (Chavez, Aym, Mots, Darbolis, Krilin — datos en `client/src/config/members.ts`). Estética **Y2K / Frutiger Aero / web 1.0 "cutre a propósito"** + **MS Paint / mano alzada**, con avatares low-poly 3D. Eslogan: *"En la era de la inteligencia artificial abraza la estupidez humana"*. La imperfección es el objetivo: nada debe verse profesional ni minimalista.

## Mapa del proyecto

- `client/` — Vite + React + TS. Dos vistas: `/` (overlay que vive en OBS, **nunca navega ni recarga**; acepta `?layout=<id>` como layout inicial para escenas OBS) y `/panel` (panel del productor, corre en su navegador).
- `server/` — Express + Socket.io. Recibe `trigger` del panel y hace broadcast de `overlay-event` al overlay. `server/obs.js` habla obs-websocket para poner las cámaras reales detrás de los agujeros del overlay (modo `?cams=real`, ver `docs/ARCHITECTURE.md` "Cámaras reales").
- Avatares 3D de los miembros: `client/src/three/avatars/` (solo primitivas + flatShading).
- 17 layouts (11 del rundown + 6 generales) registrados en `OverlayApp.tsx`; lista completa en `docs/ARCHITECTURE.md`.
- Textos en pantalla editables desde el panel: `texts`/`DEFAULT_TEXTS` en el store — nunca hardcodear texto visible en un layout.
- Filas de avatares 3D: usar `AvatarRow` (un solo Canvas) — nunca N `AvatarBust` juntos (límite de contextos WebGL).

## Docs (leer antes de tocar código)

- `docs/DESIGN_SYSTEM.md` — paleta, tipografías, criterio estético. **Consultar antes de estilizar cualquier componente nuevo.** No inventar colores ni fuentes fuera de la paleta.
- `docs/ARCHITECTURE.md` — organización, flujo de eventos (panel → Socket.io → store → componente), y lo que NO se debe hacer.
- `docs/COMPONENT_PATTERNS.md` — cómo agregar un layout o gag nuevo (patrón copiable).
- `docs/EVENTS.md` — todos los eventos Socket.io, payloads, emisores/receptores.
- `docs/PRODUCCION.md` — cómo correr en el stream (build servido por Express, checklist OBS/NDI). El dev server de Vite es solo para desarrollo.

## Reglas duras

- Sin React Router real en `/` — el layout activo es estado interno (Zustand).
- Sin `localStorage`/`sessionStorage` en ningún componente.
- Lógica de OBS (obs-websocket-js) **solo** en `server/obs.js`; el client nunca la importa — el overlay solo reporta `cam-rects`. `#FF00FF` (`--obs-key-magenta`) está reservado para el Color Key: prohibido en diseño.
- Toda decisión nueva de diseño/arquitectura se documenta en el `.md` correspondiente **en el momento**, no al final.

## Correr

```bash
# Desarrollo
cd server && npm install && node index.js   # puerto 3001
cd client && npm install && npm run dev      # puerto 5173 (solo desarrollo)

# Stream/producción: build servido por Express (ver docs/PRODUCCION.md)
cd client && npm run build && cd ../server && node index.js
```

Desarrollo: http://localhost:5173/ y /panel · Stream: http://localhost:3001/ y /panel
