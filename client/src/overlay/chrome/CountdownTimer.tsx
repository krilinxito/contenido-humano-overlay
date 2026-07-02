import { useEffect, useState } from 'react';
import { useOverlayStore } from '../../store/useOverlayStore';
import './CountdownTimer.css';

function format(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Countdown grande controlado desde el panel (`timer` start/stop).
 * Renderiza nada si no hay timer; al llegar a 0 queda parpadeando
 * "¡SE ACABÓ!" hasta que el panel lo pare.
 */
export function CountdownTimer({ className = '' }: { className?: string }) {
  const timerEndsAt = useOverlayStore((s) => s.timerEndsAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (timerEndsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  if (timerEndsAt === null) return null;

  const remaining = timerEndsAt - now;
  const expired = remaining <= 0;
  const urgent = !expired && remaining < 30_000;

  return (
    <div
      className={`countdown bevel-out ${expired ? 'countdown--expired shake-hard' : ''} ${
        urgent ? 'countdown--urgent' : ''
      } ${className}`}
    >
      {expired ? (
        <span className="countdown__done blink-hard">¡SE ACABÓ TU TIEMPO!</span>
      ) : (
        <span className="countdown__digits">{format(remaining)}</span>
      )}
    </div>
  );
}
