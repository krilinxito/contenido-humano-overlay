import { useOverlayStore, type ChatMessage } from '../../store/useOverlayStore';
import './FakeChat.css';

// Mensajes falsos de fábrica: se muestran mientras NUNCA haya llegado un
// mensaje real de Kick (dev sin kick-config.json se ve igual que siempre).
// El chat real entra por `chat-message` (server/kick.js → store.chatMessages).

const DEFAULT_CHAT: ChatMessage[] = [
  { user: 'xX_tomi_2003_Xx', msg: 'JAJAJAJA el sapo otra vez no' },
  { user: 'lauti.exe', msg: 'primera vez que veo esto, ¿es siempre así?' },
  { user: 'ModeradorSerio', msg: 'sí' },
  { user: 'sofi~*~estrellita~*~', msg: 'GRANDE CONTENIDO HUMANO 💿✨' },
  { user: 'el_croto_digital', msg: 'che se escucha con eco' },
  { user: 'xX_tomi_2003_Xx', msg: 'ES PARTE DE LA ESTÉTICA' },
  { user: 'anonimo_47', msg: 'saludos desde el 2004' },
];

interface FakeChatProps {
  messages?: ChatMessage[];
}

/** Chat estilo mensajero retro: mensajes reales de Kick si llegaron, falsos si no. */
export function FakeChat({ messages = DEFAULT_CHAT }: FakeChatProps) {
  const chatMessages = useOverlayStore((s) => s.chatMessages);
  const shown = chatMessages.length > 0 ? chatMessages : messages;
  return (
    <div className="fake-chat">
      <ul className="fake-chat__list">
        {shown.map((m, i) => (
          <li key={i} className="fake-chat__msg">
            {/* Si Kick trae color de nick se respeta; si no, el de la CSS. */}
            <span className="fake-chat__user" style={m.color ? { color: m.color } : undefined}>
              &lt;{m.user}&gt;
            </span>{' '}
            {m.msg}
          </li>
        ))}
      </ul>
      <div className="fake-chat__input bevel-in">
        <span className="blink-hard">█</span> escribí algo...
      </div>
    </div>
  );
}
