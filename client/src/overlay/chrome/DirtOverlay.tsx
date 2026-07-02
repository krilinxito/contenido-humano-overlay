import './DirtOverlay.css';

/**
 * Suciedad global del overlay (ver DESIGN_SYSTEM.md → Suciedad global):
 * grano animado, viñeta marcada, manchas y un pelo de VHS ocasional.
 * Montado UNA vez por OverlayApp encima de todo (z 180). El panel NO lo
 * lleva: es una herramienta.
 */
export function DirtOverlay() {
  return (
    <div className="dirt" aria-hidden="true">
      <div className="dirt__grain" />
      <div className="dirt__vignette" />
      <div className="dirt__stain dirt__stain--1" />
      <div className="dirt__stain dirt__stain--2" />
      <div className="dirt__stain dirt__stain--3" />
      <div className="dirt__hair" />
    </div>
  );
}
