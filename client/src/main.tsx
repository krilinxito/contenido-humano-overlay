import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/themes.css';
import './styles/retro-utils.css';
import { OverlayApp } from './overlay/OverlayApp';
import { PanelApp } from './panel/PanelApp';

// Sin React Router a propósito: `/` vive dentro de OBS y no puede navegar
// ni recargar. Solo miramos el pathname una vez al montar para decidir
// qué app renderizar (ver docs/ARCHITECTURE.md).
// Sin <StrictMode> a propósito: en dev duplicaba el montaje de TODOS los
// contextos WebGL (RetroCanvas) y el overlay se arrastraba en el navegador.
const isPanel = window.location.pathname.startsWith('/panel');

createRoot(document.getElementById('root')!).render(isPanel ? <PanelApp /> : <OverlayApp />);
