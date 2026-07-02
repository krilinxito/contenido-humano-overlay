import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/retro-utils.css';
import { OverlayApp } from './overlay/OverlayApp';
import { PanelApp } from './panel/PanelApp';

// Sin React Router a propósito: `/` vive dentro de OBS y no puede navegar
// ni recargar. Solo miramos el pathname una vez al montar para decidir
// qué app renderizar (ver docs/ARCHITECTURE.md).
const isPanel = window.location.pathname.startsWith('/panel');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPanel ? <PanelApp /> : <OverlayApp />}</StrictMode>,
);
