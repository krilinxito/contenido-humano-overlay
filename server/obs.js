// Contenido Humano — integración obs-websocket (cámaras reales).
//
// Único lugar del proyecto que habla con OBS (regla en docs/ARCHITECTURE.md).
// El overlay en modo `?cams=real` reporta los rects de sus agujeros de cámara
// (evento `cam-rects`, ver docs/EVENTS.md) y acá se traducen a
// SetSceneItemTransform: cada fuente de cámara queda posicionada DEBAJO del
// Browser Source, que la deja ver a través de su agujero magenta (Color Key).
//
// Degradación elegante: si OBS no está (dev, u OBS cerrado) todo sigue
// funcionando; los rects se guardan y se re-aplican al (re)conectar.
import OBSWebSocket from 'obs-websocket-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'obs-config.json');
const RETRY_MS = 5000;

function loadConfig() {
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.warn(`[obs] no pude leer obs-config.json (${err.message}) — integración OBS apagada.`);
    return null;
  }
  if (!cfg.enabled) {
    console.log('[obs] integración desactivada en obs-config.json ("enabled": false).');
    return null;
  }
  return {
    ...cfg,
    // Overrides por env para no tocar el json en la PC de producción.
    url: process.env.OBS_WS_URL ?? cfg.url,
    password: process.env.OBS_WS_PASSWORD ?? cfg.password,
    scene: process.env.OBS_SCENE ?? cfg.scene,
  };
}

const config = loadConfig();
const obs = new OBSWebSocket();

/** Ids que se ajustan con "fit" (SCALE_INNER, sin recortar) en vez de "cover" —
 *  pensado para pantallas compartidas, donde recortar se come contenido. */
const fitIds = new Set(config?.fit ?? []);
/** Ids de pantalla configurados: comparten agujero, así que hay que estacionar
 *  las ausentes (ver applyCamRects). */
const screenIds = config ? Object.keys(config.sources).filter((id) => id.startsWith('screen-')) : [];

let connected = false;
let base = { width: 1920, height: 1080 };
/** camId -> sceneItemId dentro de config.scene (se resuelve al conectar). */
const itemIds = new Map();
/** Último payload recibido, para re-aplicar al (re)conectar. */
let lastPayload = null;
let retryTimer = null;

function scheduleRetry() {
  if (!config || retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connect();
  }, RETRY_MS);
}

async function connect() {
  if (!config) return;
  try {
    await obs.connect(config.url, config.password || undefined);
  } catch {
    // Silencioso: OBS cerrado es un estado normal en dev; se reintenta solo.
    scheduleRetry();
    return;
  }
  connected = true;

  try {
    const video = await obs.call('GetVideoSettings');
    base = { width: video.baseWidth, height: video.baseHeight };
  } catch {
    /* si falla, quedan los 1920×1080 default */
  }

  itemIds.clear();
  warnedMissing.clear();
  for (const camId of Object.keys(config.sources)) {
    await resolveItemId(camId);
  }
  console.log(
    `[obs] conectado a ${config.url} — escena "${config.scene}", ${itemIds.size} cámaras resueltas, canvas ${base.width}x${base.height}.`,
  );

  if (lastPayload) applyCamRects(lastPayload);
}

const warnedMissing = new Set();

/**
 * Busca el sceneItemId de una cam en la escena. Se reintenta en cada
 * `cam-rects` mientras falte: así una fuente creada o renombrada DESPUÉS de
 * conectar se engancha sola, sin reiniciar el server.
 */
async function resolveItemId(camId) {
  const sourceName = config.sources[camId];
  if (!sourceName) return undefined;
  try {
    const { sceneItemId } = await obs.call('GetSceneItemId', {
      sceneName: config.scene,
      sourceName,
    });
    itemIds.set(camId, sceneItemId);
    if (warnedMissing.delete(camId)) {
      console.log(`[obs] fuente "${sourceName}" (cam "${camId}") apareció — enganchada.`);
    }
    return sceneItemId;
  } catch {
    if (!warnedMissing.has(camId)) {
      warnedMissing.add(camId);
      console.warn(`[obs] fuente "${sourceName}" (cam "${camId}") no está en la escena "${config.scene}".`);
    }
    return undefined;
  }
}

obs.on('ConnectionClosed', () => {
  if (connected) console.warn('[obs] conexión cerrada — reintentando en segundo plano.');
  connected = false;
  scheduleRetry();
});

/**
 * Aplica los rects reportados por el overlay: posiciona cada fuente de cámara
 * detrás de su agujero. Las cámaras nunca se ocultan (el overlay opaco las
 * tapa cuando el layout no las muestra) — así no parpadean entre layouts.
 *
 * Las pantallas (`screen-*`) son la excepción: todas comparten EL MISMO
 * agujero, así que la que quedó de antes taparía a la nueva según el z-order.
 * Las ausentes del payload se estacionan fuera del canvas (sin
 * SetSceneItemEnabled, es el mismo mecanismo de transform).
 */
export function applyCamRects(payload) {
  if (!config) return;
  lastPayload = payload;
  if (!connected) return;

  const present = new Set(payload.rects.map((r) => r.cam));
  for (const rect of payload.rects) {
    moveCam(rect);
  }
  for (const screenId of screenIds) {
    if (!present.has(screenId)) parkScreen(screenId);
  }
}

/** Manda una pantalla no usada fuera del canvas (a la derecha, sin escalar). */
async function parkScreen(screenId) {
  const sceneItemId = itemIds.get(screenId) ?? (await resolveItemId(screenId));
  if (sceneItemId === undefined) return;
  try {
    await obs.call('SetSceneItemTransform', {
      sceneName: config.scene,
      sceneItemId,
      sceneItemTransform: { positionX: base.width * 2, positionY: 0, alignment: 5 },
    });
  } catch (err) {
    itemIds.delete(screenId);
    console.warn(`[obs] no pude estacionar la pantalla "${screenId}": ${err.message}`);
  }
}

async function moveCam(rect) {
  const sceneItemId = itemIds.get(rect.cam) ?? (await resolveItemId(rect.cam));
  if (sceneItemId === undefined) return;
  try {
    await obs.call('SetSceneItemTransform', {
      sceneName: config.scene,
      sceneItemId,
      sceneItemTransform: {
        positionX: rect.x * base.width,
        positionY: rect.y * base.height,
        // 5 = arriba-izquierda: la posición es la esquina del bounding box.
        alignment: 5,
        // SCALE_OUTER = "cover": llena el box conservando aspecto. Sin
        // cropToBounds el desborde se escaparía por los agujeros VECINOS
        // (el overlay lo tapa, pero los otros marcos también son agujeros).
        // Los ids en config.fit (pantallas) usan SCALE_INNER = "fit": se ve
        // todo el contenido aunque quede franja (poner un fondo sólido debajo).
        boundsType: fitIds.has(rect.cam) ? 'OBS_BOUNDS_SCALE_INNER' : 'OBS_BOUNDS_SCALE_OUTER',
        boundsAlignment: 0,
        boundsWidth: Math.max(1, rect.w * base.width),
        boundsHeight: Math.max(1, rect.h * base.height),
        cropToBounds: true,
      },
    });
  } catch (err) {
    // Id viejo (fuente borrada/recreada): se descarta y el próximo
    // cam-rects lo re-resuelve.
    itemIds.delete(rect.cam);
    console.warn(`[obs] no pude mover la cam "${rect.cam}": ${err.message}`);
  }
}

/** Valida el payload de `cam-rects` que llega por socket (viene de la red). */
export function isValidCamRectsPayload(payload) {
  if (!payload || typeof payload.layout !== 'string' || !Array.isArray(payload.rects)) return false;
  return payload.rects.every(
    (r) =>
      r &&
      typeof r.cam === 'string' &&
      [r.x, r.y, r.w, r.h].every((n) => typeof n === 'number' && Number.isFinite(n)),
  );
}

export function startObsIntegration() {
  if (!config) return;
  console.log(`[obs] integración activa — conectando a ${config.url}…`);
  connect();
}
