// Contenido Humano — server de eventos.
// Recibe "trigger" (del panel) y lo re-emite tal cual como "overlay-event"
// a todos los clientes (el overlay lo consume; ver docs/EVENTS.md).
// Además recibe "cam-rects" (del overlay en modo ?cams=real) y lo traduce
// a transforms de OBS vía obs-websocket (server/obs.js) — sin re-emitirlo.
import express from 'express';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { applyCamRects, isValidCamRectsPayload, startObsIntegration } from './obs.js';

const PORT = process.env.PORT ?? 3001;
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// En producción (stream) el overlay se sirve BUILDEADO desde acá — el dev
// server de Vite es solo para desarrollo (React sin minificar + StrictMode
// monta los contextos WebGL dos veces). Ver docs/PRODUCCION.md.
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA con dos vistas por pathname (no hay router real): ambas sirven el
  // mismo index.html; express.static ya cubre `/`.
  app.get('/panel', (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send(
      'Contenido Humano — server de eventos OK. No hay build del client: correr `cd client && npm run build` para servir el overlay desde acá, o usar el dev server de Vite (solo desarrollo).',
    );
  });
}

io.on('connection', (socket) => {
  console.log(`[socket] conectado: ${socket.id}`);

  socket.on('trigger', (event) => {
    if (!event || typeof event.type !== 'string') {
      console.warn('[socket] trigger inválido, ignorado:', event);
      return;
    }
    console.log('[socket] trigger →', JSON.stringify(event));
    io.emit('overlay-event', event);
  });

  socket.on('cam-rects', (payload) => {
    if (!isValidCamRectsPayload(payload)) {
      console.warn('[socket] cam-rects inválido, ignorado:', payload);
      return;
    }
    console.log(`[socket] cam-rects (${payload.layout}) → ${payload.rects.map((r) => r.cam).join(', ') || 'ninguno'}`);
    applyCamRects(payload);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[socket] desconectado: ${socket.id} (${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Contenido Humano server escuchando en http://localhost:${PORT}`);
});

startObsIntegration();
