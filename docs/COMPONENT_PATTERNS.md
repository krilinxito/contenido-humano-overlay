# COMPONENT_PATTERNS.md — Contenido Humano

Patrones copiables. Agregar el layout #5 o el gag #4 debe ser copiar lo de acá, no reinventar.

## Anatomía de un layout

Un layout es un componente sin props (todo lo que necesita sale del store o es contenido propio). Vive en `client/src/overlay/layouts/`, ocupa toda la pantalla (`position: absolute; inset: 0`), y se anima solo (Framer Motion `motion.div` raíz con `initial/animate/exit`). `OverlayApp` lo monta dentro de `<AnimatePresence mode="wait">` keyed por el id del layout — el layout **no** maneja su propio montaje/desmontaje.

### Checklist para agregar un layout nuevo

1. Crear `client/src/overlay/layouts/MiLayout.tsx` (ver plantilla abajo).
2. Agregar su id a `LayoutId` en `client/src/store/useOverlayStore.ts`.
3. Registrarlo en el mapa `LAYOUTS` de `client/src/overlay/OverlayApp.tsx`.
4. Agregar su botón en `LAYOUT_BUTTONS` de `client/src/panel/PanelApp.tsx`.
5. (El evento `set-layout` ya lo cubre — no hay que tocar `socket.ts` ni el server, el tipo `LayoutId` se propaga solo.)

### Plantilla mínima de layout

```tsx
import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';

export function MiLayout() {
  return (
    <motion.div
      className="layout-root"
      initial={{ opacity: 0, scale: 1.15, rotate: -1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: SPRING_TORPE }}
      exit={{ opacity: 0, scale: 0.93, transition: CORTE_BRUSCO }}
    >
      {/* contenido; usar <CamPlaceholder label="CAM 1" index={0} /> donde vaya video real */}
    </motion.div>
  );
}
```

Donde vaya video real de cámara usar siempre `<CamPlaceholder />` (`client/src/overlay/chrome/CamPlaceholder.tsx`) — después se reemplaza por `<video>`/NDI sin tocar la composición. Para pantallas compartidas (screen share, PPT, visuales) usar `<ScreenPlaceholder label="..." />`. Para marcos de ventana XP usar `<XPWindow title="...">` (`chrome/XPWindow.tsx`).

### Piezas reusables para layouts del programa

- **`ScreenPlusCams`** (`layouts/ScreenPlusCams.tsx`) — composición interna (NO registrada como layout): pantalla grande + strip vertical con las 5 cams; prop `highlight` resalta a un miembro. La usan Lección, Tema y CamsPantalla.
- **`CamCell`** (`chrome/CamCell.tsx`) — celda de cámara de UN miembro (placeholder + nametag con su color + `highlight`). Usarla siempre que un layout muestre cams de miembros en strips/filas/grillas (la usan ScreenPlusCams, Debate, BUM h/v, Penitencia) — no rearmar la celda a mano.
- **`VideoPlaceholder`** (`chrome/VideoPlaceholder.tsx`) — reproductor trucho para videos/reels (prop `vertical` para formato 9:16 con marco de teléfono). Acá va el video real después.
- **`MemberBadge`** (`chrome/MemberBadge.tsx`) — sticker Paint con avatar 3D + nombre + adjetivo random (`size: 'lg' | 'sm'`). Los datos salen de `config/members.ts`.
- **`CountdownTimer`** (`chrome/CountdownTimer.tsx`) — countdown que lee `timerEndsAt` del store; se controla desde el panel (sección Timer). Renderiza nada sin timer activo.
- **`FakeChat`** (`chrome/FakeChat.tsx`) — chat falso retro (TODO: acá se enchufa el chat real).
- **`Doodles`** (`chrome/Doodles.tsx`) — garabatos SVG (`DoodleArrow/Star/Squiggle/Circle`); posicionarlos desde el CSS del layout.
- **`CHBug` / `PhaseBanner`** — chrome persistente; los monta `OverlayApp`, un layout NUNCA los incluye por su cuenta (excepción: Intro usa `CHBug` en versión XL con `className="ch-bug-wrap--xl"` y por eso está en `LAYOUTS_SIN_BUG`).

Si el layout depende del miembro seleccionado (quién habla/expone), leer `activeMember` del store y resolver los datos con `MEMBERS[activeMember]`; contemplar el caso `null` (ver `Tertulia.tsx` como ejemplo completo).

### Textos en pantalla

Todo texto visible que el productor pueda querer cambiar en vivo va en `texts` del store (default en `DEFAULT_TEXTS`, `useOverlayStore.ts`) y se lee con `useOverlayStore((s) => s.texts.miClave)` — **nunca hardcodeado en el layout**. Para agregar uno: sumar la clave a `TextKey` + `DEFAULT_TEXTS`, y su fila a `TEXT_FIELDS` (frecuentes) o al grupo que corresponda de `TEXT_GROUPS` en `PanelApp.tsx`. Documentar en la tabla de `docs/EVENTS.md`.

Quedan afuera (a propósito): labels de `CamPlaceholder`/`ScreenPlaceholder` (en stream los tapa la cámara real) y utilería fija de chiste (las "personas" del TalkshowGrid, los `CREDITOS_EXTRA` del Outro) — eso se cambia en código.

**Nombres de miembros**: nunca mostrar `MEMBERS[id].nombre` directo en el overlay — usar `getMemberName(texts, id)` (`useOverlayStore.ts`), que respeta el editable `nombre-<id>` del panel con fallback al de config. `MEMBERS[id].nombre` directo solo en el panel (chips) y como default.

## Anatomía de un gag

Un gag es una capa superpuesta a pantalla completa (no reemplaza al layout). Vive en `client/src/overlay/gags/`. Igual que los layouts: `motion.div` raíz con `initial/animate/exit`, montado por `OverlayApp` dentro de un `<AnimatePresence>` propio (separado del de layouts). La duración NO la maneja el gag: la define `GAG_DURATIONS_MS` en el store, que auto-limpia `activeGag`.

### Checklist para agregar un gag nuevo

1. Crear `client/src/overlay/gags/MiGag.tsx`.
2. Agregar su id a `GagId` y su duración a `GAG_DURATIONS_MS` en `useOverlayStore.ts`.
3. Registrarlo en el mapa `GAGS` de `OverlayApp.tsx`.
4. Agregar su botón en `GAG_BUTTONS` de `PanelApp.tsx`.
5. Documentar la duración/comportamiento en `docs/EVENTS.md`.

### Plantilla mínima de gag

```tsx
import { motion } from 'framer-motion';
import { REBOTE_ZOCALO, CORTE_BRUSCO } from '../motionPresets';

export function MiGag() {
  return (
    <motion.div
      className="gag-root"
      initial={{ y: '-110%' }}
      animate={{ y: 0, transition: REBOTE_ZOCALO }}
      exit={{ y: '110%', transition: CORTE_BRUSCO }}
    >
      {/* contenido del gag */}
    </motion.div>
  );
}
```

## Anatomía de un avatar 3D

Los avatares de la plebe viven en `client/src/three/avatars/`, uno por archivo. Reglas en DESIGN_SYSTEM.md (sección Avatares). Para agregar/modificar uno:

1. Crear `avatars/AvatarNuevo.tsx`: un `<group>` de primitivas centrado en el origen (cabeza ~y=0.55, torso ~y=-0.78), usando `Eyes`/`Glasses`/`Mouth` de `avatars/parts.tsx` cuando aplique.
2. Colores desde `MEMBERS.<id>` (`skin`, `hair`, `color` para la remera) — nunca hex sueltos en el avatar.
3. Registrar en el mapa `AVATARS` de `Avatar3D.tsx`.
4. Si es un miembro nuevo del programa: agregarlo a `MEMBERS`/`MemberId` en `config/members.ts` (nombre, adjetivos, colores) — el panel, badges y strips lo levantan solos.

La idle animation NO va en el avatar (la pone `Avatar3D`); el avatar es geometría estática.

**Regla de `RetroCanvas`**: TODO 3D se monta con **`RetroCanvas`** (`three/RetroCanvas.tsx`), nunca `<Canvas>` de R3F directo. Centraliza: `dpr=1`, muestreo a ~24fps (`frameloop="demand"` + ticker interno, prop `fps` para excepciones justificadas), flags de `gl`, y `resize={{ offsetSize: true }}`. Lo del `offsetSize` es crítico: sin eso R3F mide con `getBoundingClientRect`, que se ve afectado por los `transform` de Framer Motion — y como los layouts entran animando `scale`, el canvas queda medido a escala equivocada (o 0×0 si el elemento entra desde `scale: 0`) y el transform no dispara re-medición: avatares corridos/cortados o canvas en blanco para siempre.

**Regla de contextos WebGL**: nunca montar N `AvatarBust` a la vez — cada canvas es un contexto WebGL y el navegador descarta los más viejos (avatares en negro). Para filas/grillas usar **`AvatarRow`** (`three/avatars/AvatarRow.tsx`): un solo Canvas con los N avatares posicionados por `viewport.width` (quedan alineados con su fila HTML de nametags). Para columnas superpuestas a filas HTML de alto fijo usar **`AvatarColumn`** (mismo archivo; así hace el Outro sus créditos — las filas llevan una celda placeholder y el canvas único cae encima). `AvatarBust` es solo para UN avatar individual y **uno solo simultáneo** (el `MemberBadge` lg). Presupuesto por layout: 1 row/column + 1 bust + 1 gag transitorio, máximo.

## Cómo agregar un sonido (soundboard / música)

Tirar el mp3 en **`client/src/assets/audio/`** con el prefijo correcto y listo — aparece solo como botón en el panel (auto-descubrimiento por `import.meta.glob` en `config/sounds.ts`; en producción requiere rebuild):

- `sfx_<id>.mp3` → botón del SOUNDBOARD (one-shot, pueden solaparse, volumen full).
- `music_<id>.mp3` → track de MÚSICA (loop, volumen con el slider del panel).

El `<id>` (kebab-case) es el label del botón (guiones → espacios). El audio lo reproduce **siempre el overlay** dentro de OBS — panel y server no suenan (ver ARCHITECTURE.md, "Audio"). Si un SFX acompaña a un gag visual, dispararlos juntos desde el panel o encadenar el `playSfx()` en el propio gag.

## Convenciones generales

- Componentes: un archivo por componente, export nombrado (no default), PascalCase.
- Clases CSS: kebab-case, prefijo por componente (`.talkshow-grid__cell`), utilidades globales sin prefijo (`.bevel-out`).
- Estilos: cada layout/gag puede tener CSS propio junto al `.tsx` (`MiLayout.css`), pero colores/fuentes SIEMPRE via variables de `tokens.css`.
- Animaciones: usar los presets de `motionPresets.ts`. Si un componente necesita una curva nueva, se agrega ahí con nombre y se documenta en `DESIGN_SYSTEM.md` (sección Motion).
- Assets estáticos: `client/public/`, kebab-case (`sparkle-star.svg`). Preferir SVG inline/data-uri para no depender de archivos.
- Three.js: escenas en `client/src/three/`, siempre `flatShading: true` (ver DESIGN_SYSTEM.md).
