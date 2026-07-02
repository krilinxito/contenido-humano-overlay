import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { ComponentProps } from 'react';

// Canvas de la casa. Regla dura (DESIGN_SYSTEM.md / COMPONENT_PATTERNS.md):
// todo 3D del overlay pasa por acá, nunca por <Canvas> directo.
// - dpr=1: OBS renderiza a 1920x1080 con dpr 1 igual; en previews hidpi
//   ahorra hasta 4x los píxeles y el pixelado extra pega con el look chunky.
// - frameloop="demand" + FrameTicker: los canvas muestrean a ~24fps en vez
//   de 60. El movimiento queda medio stop-motion — es parte de la estética
//   (mismo lenguaje que los steps() de CSS), no un bug.
// - offsetSize: medir por layout, no por boundingRect — los layouts entran
//   animando scale con framer y el rect escalado deja el canvas mal
//   dimensionado para siempre (ver COMPONENT_PATTERNS.md).

const DEFAULT_FPS = 24;

function FrameTicker({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const interval = 1000 / fps;
    let last = performance.now();
    let raf = 0;
    invalidate(); // primer frame al montar
    const tick = (now: number) => {
      if (now - last >= interval) {
        last = now - ((now - last) % interval);
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, invalidate]);
  return null;
}

interface RetroCanvasProps extends Omit<ComponentProps<typeof Canvas>, 'dpr' | 'frameloop'> {
  /** Frames por segundo del muestreo 3D. Subir solo si un gag lo pide. */
  fps?: number;
}

export function RetroCanvas({ fps = DEFAULT_FPS, gl, children, ...props }: RetroCanvasProps) {
  return (
    <Canvas
      dpr={1}
      frameloop="demand"
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, ...gl }}
      resize={{ offsetSize: true }}
      {...props}
    >
      <FrameTicker fps={fps} />
      {children}
    </Canvas>
  );
}
