import './VideoPlaceholder.css';

interface VideoPlaceholderProps {
  label: string;
  /** Formato reel/tiktok (9:16); default horizontal. */
  vertical?: boolean;
  className?: string;
}

/**
 * Placeholder de video/reel para los Best Unemployment Moments: reproductor
 * trucho con barra de progreso falsa. Acá va el video real después,
 * sin tocar la composición del layout.
 */
export function VideoPlaceholder({ label, vertical = false, className = '' }: VideoPlaceholderProps) {
  return (
    <div className={`video-placeholder ${vertical ? 'video-placeholder--vertical' : ''} ${className}`}>
      <span className="video-placeholder__play">▶</span>
      <span className="video-placeholder__label chroma-text">{label}</span>
      <div className="video-placeholder__controls">
        <span className="video-placeholder__time">0:07 / 0:34</span>
        <div className="video-placeholder__bar bevel-in">
          <div className="video-placeholder__progress" />
        </div>
        <span className="video-placeholder__vol">🔊</span>
      </div>
      <span className="video-placeholder__buffering blink-hard">buffering… 99%</span>
    </div>
  );
}
