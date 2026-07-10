// Contenido Humano — server de eventos.
// Recibe "trigger" (del panel) y lo re-emite tal cual como "overlay-event"
// a todos los clientes (el overlay lo consume; ver docs/EVENTS.md).
// Además recibe "cam-rects" (del overlay en modo ?cams=real) y lo traduce
// a transforms de OBS vía obs-websocket (server/obs.js) — sin re-emitirlo.
import express from 'express';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import multer from 'multer';
import { applyCamRects, isValidCamRectsPayload, startObsIntegration } from './obs.js';
import { startKickIntegration } from './kick.js';

const PORT = process.env.PORT ?? 3001;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, '../client/dist');
const UPLOADS = path.join(ROOT, 'uploads');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// ---- Memes (imágenes/videos subidos desde el panel, ver docs/EVENTS.md) ----
// Los archivos quedan en server/uploads/ (gitignoreado) y se sirven en
// /media/<archivo>. El panel los sube por POST /api/media y dispara el
// evento `media` por socket para mostrarlos en el overlay.
mkdirSync(UPLOADS, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => {
      // Nombre original saneado + timestamp para no pisar subidas repetidas.
      const base = path
        .parse(file.originalname)
        .name.replace(/[^a-zA-Z0-9-_]+/g, '_')
        .slice(0, 60);
      cb(null, `${Date.now()}-${base}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'));
  },
});

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.mkv']);

app.use('/media', express.static(UPLOADS));

// CORS simple para el panel en dev (Vite 5173 → server 3001). El DELETE
// dispara preflight, así que también se responde el OPTIONS.
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.post('/api/media', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'archivo faltante o tipo no permitido (solo imagen/video)' });
    return;
  }
  console.log(`[media] subido: ${req.file.filename} (${Math.round(req.file.size / 1024)} KB)`);
  res.json({ url: `/media/${req.file.filename}` });
});

app.get('/api/media', (_req, res) => {
  const files = readdirSync(UPLOADS)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) || VIDEO_EXT.has(path.extname(f).toLowerCase()))
    .sort()
    .reverse() // más nuevos primero (prefijo timestamp)
    .map((f) => ({
      name: f.replace(/^\d+-/, ''),
      url: `/media/${f}`,
      kind: VIDEO_EXT.has(path.extname(f).toLowerCase()) ? 'video' : 'image',
    }));
  res.json(files);
});

app.delete('/api/media/:file', (req, res) => {
  // basename anti path-traversal: el param jamás puede salir de uploads/.
  const file = path.basename(req.params.file);
  const target = path.join(UPLOADS, file);
  if (!existsSync(target)) {
    res.status(404).json({ error: 'no existe' });
    return;
  }
  try {
    unlinkSync(target);
    console.log(`[media] borrado: ${file}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// En producción (stream) el overlay se sirve BUILDEADO desde acá — el dev
// server de Vite es solo para desarrollo (React sin minificar).
// Ver docs/PRODUCCION.md.
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
// Chat real de Kick (kick.js): único evento que nace en el server — se
// broadcastea con la misma forma `overlay-event` que todo lo demás.
startKickIntegration((event) => io.emit('overlay-event', event));
