# Contenido Humano — Overlay

Overlay para OBS Studio del talkshow/podcast **"Contenido Humano"**. Estética Y2K / Frutiger Aero / web 1.0 "cutre a propósito", con avatares low-poly 3D. Eslogan: *"En la era de la inteligencia artificial abraza la estupidez humana"*.

Son dos piezas que corren en la misma máquina (o red local):

- **Client** (Vite + React + TypeScript): el overlay que carga OBS en `/` y el panel del productor en `/panel`.
- **Server** (Express + Socket.io): recibe los triggers del panel y los transmite al overlay. Opcionalmente habla con OBS vía obs-websocket para mover las cámaras reales.

## Instalación desde cero (PC sin nada instalado)

Solo hacen falta **dos herramientas**: Git (para clonar) y Node.js (que ya trae `npm`). Todo lo demás se instala solo con `npm install`.

### 1. Instalar Node.js

Bajá el instalador **LTS** desde https://nodejs.org (versión 20 o superior) y seguí el asistente. En Linux también podés usar el gestor de paquetes de tu distro (`sudo dnf install nodejs` / `sudo apt install nodejs npm`).

Verificá que quedó instalado abriendo una terminal:

```bash
node --version   # debería mostrar v20.x o superior
npm --version
```

### 2. Instalar Git y clonar el repo

Bajá Git desde https://git-scm.com (en Linux: `sudo dnf install git` / `sudo apt install git`). Después:

```bash
git clone https://github.com/krilinxito/contenido-humano-overlay.git
cd contenido-humano-overlay
```

*(Alternativa sin Git: en la página del repo en GitHub, botón verde **Code → Download ZIP**, y descomprimir.)*

### 3. Instalar las dependencias

Cada mitad tiene sus propias dependencias, así que son dos `npm install`:

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

Con eso ya está todo instalado.

## Cómo correr (desarrollo)

Dos procesos, dos terminales:

```bash
# Terminal 1 — server de eventos (Socket.io, puerto 3001)
cd server
node index.js

# Terminal 2 — client (Vite, puerto 5173)
cd client
npm run dev
```

Después:

- **Overlay** (lo que carga OBS como Browser Source): http://localhost:5173/
- **Panel del productor**: http://localhost:5173/panel

Desde el panel se cambia de layout y se disparan los gags. El overlay reacciona en vivo vía Socket.io — no hace falta OBS para testear, con dos pestañas del navegador alcanza.

## Cómo correr (stream / producción)

Para el stream no se usa el dev server de Vite: se hace el build y lo sirve el mismo Express (ver `docs/PRODUCCION.md` para el checklist completo de OBS/NDI):

```bash
cd client && npm run build
cd ../server && node index.js
```

Overlay en http://localhost:3001/ y panel en http://localhost:3001/panel.

## Integración con OBS (cámaras reales, opcional)

Para que el server ponga las cámaras reales de OBS detrás de los agujeros del overlay (modo `?cams=real`), copiá el archivo de ejemplo y completalo con tus datos:

```bash
cd server
cp obs-config.example.json obs-config.json
```

Editá `obs-config.json`: poné `"enabled": true`, la contraseña del obs-websocket de tu OBS (Herramientas → Ajustes del servidor WebSocket) y los nombres reales de tus fuentes de cámara. **Ese archivo no se sube al repo** (está en `.gitignore`) porque contiene la contraseña. Si no existe o está en `enabled: false`, el overlay funciona igual con cámaras placeholder.

Detalles en `docs/ARCHITECTURE.md`, sección "Cámaras reales".

## Qué hay

- **Layouts del rundown (11)**: Intro (logo CH XL + los 5 avatares 3D + chat), Tertulia (cam individual + badge del que habla), El Tema (visuales + 5 cams), Lección (pantalla del profe + 5 cams), PPT Hot Topic (presentación trucha + timer de 5 min), Debate (expositor VS los otros 4), Más Papeado (ceremonia del perdedor con spotlight y sello), BUM Horizontal y BUM Vertical (video/reel + cams reaccionando), Penitencia (castigado en grande + la plebe reaccionando), Outro (créditos rodando sobre la escena 3D).
- **Layouts generales (6)**: Talkshow Grid (5 cams estilo Brady Bunch en ventanas XP), Plano General (+ chat falso), Plano 360 (cámara mareada), Cams + Pantalla (de un miembro o del productor), Noticiero (zócalo animado + ticker), Ya Volvemos (escena 3D low-poly).
- **3 gags**: Glitch VHS, Alerta Falsa (breaking news), Sapo Random. Se auto-limpian solos.
- **Chrome persistente**: bug CH con el eslogan en todos los layouts + banner de fase del programa (controlado desde el panel).
- **Avatares 3D low-poly** de los 5 miembros (`client/src/three/avatars/`), configurables en `client/src/config/members.ts`.
- **Panel del productor** (consola compacta): escenas en orden de rundown, miembro activo (quién habla/expone/paga), fase, video BUM (cada miembro trae sus 5 reels: quién + cuál 1..5), timer, gags, y **todos los textos en pantalla editables en vivo** (tema, zócalo, ticker, penitencia, marquees).

## Uso con OBS (modo híbrido)

Cada escena de OBS carga un Browser Source con su layout fijo, y las transiciones entre escenas las hace OBS:

```
http://localhost:3001/?layout=intro
http://localhost:3001/?layout=tertulia
http://localhost:3001/?layout=leccion
http://localhost:3001/?layout=ppt      (etc.)
```

El panel sigue mandando lo dinámico (miembro activo, fase, timer, gags) a todas las escenas a la vez vía Socket.io. El cambio de layout desde el panel queda para testear sin OBS.

## Cómo agregar un layout o gag nuevo

Seguí el patrón documentado en **`docs/COMPONENT_PATTERNS.md`** (plantilla + checklist de 5 pasos). Antes de estilizar, leé **`docs/DESIGN_SYSTEM.md`** — paleta, fuentes y criterio estético son ley. Los eventos Socket.io están en **`docs/EVENTS.md`** y la arquitectura general en **`docs/ARCHITECTURE.md`**.

## Reglas de la casa

- La ruta `/` (overlay) nunca navega ni recarga: los layouts son estado de Zustand, no rutas.
- Nada de `localStorage`/`sessionStorage`.
- Colores y fuentes solo desde `client/src/styles/tokens.css`. `#FF00FF` está reservado para el Color Key de OBS: prohibido en diseño.
- La lógica de obs-websocket vive **solo** en `server/obs.js`; el client nunca la importa.
