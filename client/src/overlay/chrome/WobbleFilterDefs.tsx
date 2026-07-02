/**
 * Filtro SVG #wobble: feTurbulence + feDisplacementMap para bordes
 * irregulares "dibujados a mano". Se monta UNA vez (en OverlayApp y
 * PanelApp) y cualquier elemento lo usa con la clase `.wobble-border`.
 * No generar clip-paths a mano por componente (ver DESIGN_SYSTEM.md).
 */
export function WobbleFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="wobble-strong" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="3" seed="23" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Look crayón/Paint para .scribble-border. Intensidad moderada:
            aplicarlo solo a capas de fondo/borde, nunca sobre texto o
            canvas (los vuelve ilegibles) — ver DESIGN_SYSTEM.md. */}
        <filter id="scribble" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="turbulence" baseFrequency="0.03 0.045" numOctaves="3" seed="42" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
