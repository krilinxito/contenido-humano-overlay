import './FakeChat.css';

// TODO(chat): acá se conecta el chat real (Twitch/YouTube) más adelante;
// este componente es el placeholder visual con mensajes falsos.

const DEFAULT_CHAT = [
  { user: 'xX_tomi_2003_Xx', msg: 'JAJAJAJA el sapo otra vez no' },
  { user: 'lauti.exe', msg: 'primera vez que veo esto, ¿es siempre así?' },
  { user: 'ModeradorSerio', msg: 'sí' },
  { user: 'sofi~*~estrellita~*~', msg: 'GRANDE CONTENIDO HUMANO 💿✨' },
  { user: 'el_croto_digital', msg: 'che se escucha con eco' },
  { user: 'xX_tomi_2003_Xx', msg: 'ES PARTE DE LA ESTÉTICA' },
  { user: 'anonimo_47', msg: 'saludos desde el 2004' },
];

interface FakeChatProps {
  messages?: { user: string; msg: string }[];
}

/** Lista de chat falso estilo mensajero retro + input decorativo. */
export function FakeChat({ messages = DEFAULT_CHAT }: FakeChatProps) {
  return (
    <div className="fake-chat">
      <ul className="fake-chat__list">
        {messages.map((m, i) => (
          <li key={i} className="fake-chat__msg">
            <span className="fake-chat__user">&lt;{m.user}&gt;</span> {m.msg}
          </li>
        ))}
      </ul>
      <div className="fake-chat__input bevel-in">
        <span className="blink-hard">█</span> escribí algo...
      </div>
    </div>
  );
}
