// Contenido Humano — chat real de Kick (solo lectura).
//
// Espejo del patrón de obs.js: config propia (kick-config.json, gitignoreado),
// degradación elegante (sin config o Kick caído → el overlay sigue con el
// chat falso) y retry en segundo plano.
//
// Conexión anónima al websocket Pusher público de Kick (el mismo que usa el
// sitio; no requiere cuenta ni token) suscripto a `chatrooms.<id>.v2`. Cada
// mensaje se re-emite como `overlay-event { type: 'chat-message' }` — el
// PRIMER evento que nace en el server y no en el panel (ver ARCHITECTURE.md).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'kick-config.json');
const RETRY_MS = 5000;

// App key pública del Pusher de Kick (viaja en el JS del propio sitio, no es
// un secreto). Overrideable en el json por si Kick la rota.
const DEFAULT_PUSHER_URL =
  'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false';

function loadConfig() {
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.warn(`[kick] no pude leer kick-config.json (${err.message}) — chat real apagado.`);
    return null;
  }
  if (!cfg.enabled) {
    console.log('[kick] chat real desactivado en kick-config.json ("enabled": false).');
    return null;
  }
  if (!cfg.channel && !cfg.chatroomId) {
    console.warn('[kick] kick-config.json sin "channel" ni "chatroomId" — chat real apagado.');
    return null;
  }
  return { ...cfg, pusherUrl: cfg.pusherUrl ?? DEFAULT_PUSHER_URL };
}

const config = loadConfig();

let emitEvent = null;
let chatroomId = null;
let ws = null;
let retryTimer = null;
let wasConnected = false;

function scheduleRetry() {
  if (!config || retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connect();
  }, RETRY_MS);
}

/**
 * Resuelve el chatroomId desde la API pública de Kick. Cloudflare a veces
 * bloquea el fetch server-side: en ese caso se cae al "chatroomId" manual del
 * json (se saca del devtools del navegador, ver PRODUCCION.md).
 */
async function resolveChatroomId() {
  if (!config.channel) return config.chatroomId ?? null;
  try {
    const res = await fetch(`https://kick.com/api/v2/channels/${config.channel}`, {
      headers: {
        accept: 'application/json',
        // Sin user-agent de navegador Cloudflare corta seguro.
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.chatroom?.id) throw new Error('respuesta sin chatroom.id');
    console.log(`[kick] canal "${config.channel}" → chatroom ${data.chatroom.id}.`);
    return data.chatroom.id;
  } catch (err) {
    if (config.chatroomId) {
      console.warn(`[kick] no pude resolver el canal (${err.message}) — uso chatroomId manual ${config.chatroomId}.`);
      return config.chatroomId;
    }
    console.warn(`[kick] no pude resolver el canal (${err.message}) y no hay chatroomId manual — reintento en ${RETRY_MS / 1000}s.`);
    return null;
  }
}

/** `[emote:37226:KEKW]` → `KEKW` (el overlay no renderiza emotes de Kick). */
function stripEmotes(content) {
  return content.replace(/\[emote:\d+:([^\]]*)\]/g, '$1').trim();
}

function handlePusherMessage(raw) {
  let frame;
  try {
    frame = JSON.parse(raw);
  } catch {
    return;
  }
  switch (frame.event) {
    case 'pusher:connection_established':
      ws.send(
        JSON.stringify({
          event: 'pusher:subscribe',
          data: { auth: '', channel: `chatrooms.${chatroomId}.v2` },
        }),
      );
      console.log(`[kick] conectado — escuchando chatrooms.${chatroomId}.v2.`);
      wasConnected = true;
      break;
    case 'pusher:ping':
      ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
      break;
    case 'App\\Events\\ChatMessageEvent': {
      let data;
      try {
        data = JSON.parse(frame.data);
      } catch {
        return;
      }
      const msg = typeof data?.content === 'string' ? stripEmotes(data.content) : '';
      const user = data?.sender?.username;
      if (!msg || !user) return;
      emitEvent({
        type: 'chat-message',
        user,
        msg: msg.slice(0, 200),
        color: data.sender.identity?.color || undefined,
      });
      break;
    }
    default:
      break; // suscripción ok, eventos de subs/bans/etc: no interesan
  }
}

async function connect() {
  chatroomId ??= await resolveChatroomId();
  if (chatroomId === null) {
    scheduleRetry();
    return;
  }
  ws = new WebSocket(config.pusherUrl);
  ws.addEventListener('message', (e) => handlePusherMessage(e.data));
  ws.addEventListener('close', () => {
    if (wasConnected) console.warn('[kick] conexión cerrada — reintentando en segundo plano.');
    wasConnected = false;
    scheduleRetry();
  });
  ws.addEventListener('error', () => {
    // El close llega igual después del error; el log iría duplicado.
  });
}

/**
 * Arranca la integración. `emit` recibe el evento ya con forma de
 * `overlay-event` y lo broadcastea (io.emit en index.js).
 */
export function startKickIntegration(emit) {
  if (!config) return;
  emitEvent = emit;
  console.log(`[kick] chat real activo — canal "${config.channel ?? `chatroom ${config.chatroomId}`}"…`);
  connect();
}
