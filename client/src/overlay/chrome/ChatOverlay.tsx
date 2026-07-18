import { motion } from 'framer-motion';
import { useOverlayStore } from '../../store/useOverlayStore';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { XPWindow } from './XPWindow';
import { FakeChat } from './FakeChat';
import './ChatOverlay.css';

/**
 * Chat de Kick flotante sobre cualquier layout (botón CHAT del panel,
 * evento `chat-overlay`). Vive en OverlayApp encima del chrome (z 60) y
 * debajo de memes/gags; el productor lo muestra/oculta cuando quiere.
 */
export function ChatOverlay() {
  const title = useOverlayStore((s) => s.texts['window-chat']);
  return (
    <motion.aside
      className="chat-overlay"
      initial={{ x: '120%', rotate: 3 }}
      animate={{ x: 0, rotate: -0.6, transition: SPRING_TORPE }}
      exit={{ x: '120%', rotate: 4, transition: CORTE_BRUSCO }}
    >
      <XPWindow title={title} className="chat-overlay__window">
        <FakeChat />
      </XPWindow>
    </motion.aside>
  );
}
