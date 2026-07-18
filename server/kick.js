// Contenido Humano — chat real de Kick (solo lectura).
//
// Espejo del patrón de obs.js: config propia (kick-config.json, gitignoreado),
// degradación elegante (sin config o Kick caído → el overlay sigue con el
// chat falso) y retry en segundo plano.
//
// Conexión anónima al websocket Pusher público de Kick (el mismo que usa el
// sitio; no requiere cuenta ni token) suscripto a `chatrooms.<id>.v2` (chat)
// y a `channel.<channelId>` (follows). Cada mensaje se re-emite como
// `overlay-event { type: 'chat-message' }` y cada follow nuevo como
// `{ type: 'follow' }` — eventos que nacen en el server y no en el panel
// (ver ARCHITECTURE.md). Para follows hace falta el channelId (distinto del
// chatroomId): sale de la misma API, o manual en el json si Cloudflare corta.
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
let channelId = null;
let ws = null;
let retryTimer = null;
let wasConnected = false;
// Baseline de followersCount: Kick manda FollowersUpdated también en
// unfollows y al suscribirse; solo se anuncia cuando el contador SUBE.
let lastFollowers = null;

function scheduleRetry() {
  if (!config || retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connect();
  }, RETRY_MS);
}

/**
 * Resuelve chatroomId (chat) y channelId (follows) desde la API pública de
 * Kick. Cloudflare a veces bloquea el fetch server-side: en ese caso se cae a
 * los "chatroomId"/"channelId" manuales del json (se sacan del devtools del
 * navegador, ver PRODUCCION.md). Sin channelId el chat anda igual; solo se
 * pierden los avisos de follow.
 */
async function resolveIds() {
  channelId ??= config.channelId ?? null;
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
    channelId ??= data.id ?? null;
    console.log(`[kick] canal "${config.channel}" → chatroom ${data.chatroom.id}, channel ${channelId ?? '?'}.`);
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
      if (channelId) {
        ws.send(
          JSON.stringify({
            event: 'pusher:subscribe',
            data: { auth: '', channel: `channel.${channelId}` },
          }),
        );
      } else {
        console.warn('[kick] sin channelId (API bloqueada y no está en el json) — avisos de follow apagados.');
      }
      console.log(
        `[kick] conectado — escuchando chatrooms.${chatroomId}.v2${channelId ? ` + channel.${channelId} (follows)` : ''}.`,
      );
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
    // Follow nuevo: Kick manda FollowersUpdated también en unfollows y como
    // snapshot al suscribirse — solo se anuncia con `followed: true` y el
    // contador subiendo (evita rebotes/duplicados). El username a veces
    // viene null; el overlay tiene texto genérico para ese caso.
    case 'App\\Events\\FollowersUpdated': {
      let data;
      try {
        data = JSON.parse(frame.data);
      } catch {
        return;
      }
      const count = typeof data?.followersCount === 'number' ? data.followersCount : null;
      const prev = lastFollowers;
      if (count !== null) lastFollowers = count;
      if (!data?.followed) return;
      if (count !== null && prev !== null && count <= prev) return;
      const user = typeof data.username === 'string' && data.username.trim() ? data.username.trim() : undefined;
      console.log(`[kick] follow nuevo${user ? `: ${user}` : ''} (${count ?? '?'} seguidores).`);
      emitEvent({ type: 'follow', user });
      break;
    }
    default:
      break; // suscripción ok, eventos de subs/bans/etc: no interesan
  }
}

async function connect() {
  chatroomId ??= await resolveIds();
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
