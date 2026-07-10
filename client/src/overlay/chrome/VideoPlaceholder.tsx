import { useEffect, useRef } from 'react';
import { CAMS_REAL, registerCamHole } from '../camRectReporter';
import type { ScreenId } from '../../config/cams';
import './VideoPlaceholder.css';

interface VideoPlaceholderProps {
  label: string;
  /** Formato reel/tiktok (9:16); default horizontal. */
  vertical?: boolean;
  /**
   * Pantalla real que reproduce el video (BUM = `screen-bum`, mapeada a una
   * fuente en obs-config.json). En modo `?cams=real` el área se vuelve agujero
   * color-key y quedan encima solo los controles falsos (opacos, como un
   * reproductor de verdad). Sin `screen`, o fuera de ese modo, placeholder.
   */
  screen?: ScreenId;
  className?: string;
}

/**
 * Placeholder de video/reel para los Best Unemployment Moments: reproductor
 * trucho con barra de progreso falsa. Con `screen` + `?cams=real` el video
 * real de OBS se ve a través (mismo mecanismo que Cam/ScreenPlaceholder).
 */
export function VideoPlaceholder({ label, vertical = false, screen, className = '' }: VideoPlaceholderProps) {
  const holeRef = useRef<HTMLDivElement>(null);
  const isHole = CAMS_REAL && screen !== undefined;

  useEffect(() => {
    if (!isHole || !holeRef.current || !screen) return;
    return registerCamHole(holeRef.current, screen);
  }, [isHole, screen]);

  return (
    <div
      ref={holeRef}
      className={`video-placeholder ${vertical ? 'video-placeholder--vertical' : ''} ${
        isHole ? 'video-placeholder--hole' : ''
      } ${className}`}
    >
      {!isHole && (
        <>
          <span className="video-placeholder__play">▶</span>
          <span className="video-placeholder__label chroma-text">{label}</span>
          <span className="video-placeholder__buffering blink-hard">buffering… 99%</span>
        </>
      )}
      <div className="video-placeholder__controls">
        <span className="video-placeholder__time">0:07 / 0:34</span>
        <div className="video-placeholder__bar bevel-in">
          <div className="video-placeholder__progress" />
        </div>
        <span className="video-placeholder__vol">🔊</span>
      </div>
    </div>
  );
}
