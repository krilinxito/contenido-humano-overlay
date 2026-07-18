# DESIGN_SYSTEM.md — Contenido Humano

Fuente de verdad estética. **Consultar este archivo antes de estilizar cualquier componente nuevo.** Si un color, fuente o efecto no está acá, no se usa (o se agrega acá primero).

## Criterio estético (en palabras)

- **"Cutre a propósito"**: Y2K, Frutiger Aero, Geocities, Windows XP/2000, low-poly con flat shading. La imperfección es un feature. Nada minimalista, nada corporativo, nada "limpio".
- **Transiciones**: nunca suaves/corporativas. Preferir cortes bruscos, overshoot, rebotes exagerados. Ver sección Motion.
- **Gradientes**: siempre 3-4 colores de la paleta, con ángulos raros (23°, 137°, 68°… nunca 90°/180° prolijos). Referencia: fondos de Windows Movie Maker / Kazaa.
- **Bordes**: biselados XP (clase `.bevel-out` / `.bevel-in`) o irregulares "a mano" (filtro SVG `#wobble`, ver Efectos). Nunca `border-radius` prolijo sin bisel.
- **Chroma key imperfecto**: halos verdes y bordes toscos son intencionales.
- **Densidad**: mejor recargado que vacío. Sparkles, marquees, cursores custom, texturas.

## Paleta (variables CSS en `client/src/styles/tokens.css`)

| Variable | Hex | Uso previsto |
|---|---|---|
| `--xp-blue-deep` | `#0A246A` | Barras de título de ventana XP, fondos de chrome "sistema", texto sobre claro |
| `--xp-blue-bright` | `#3D7EFF` | Botones, links, acentos interactivos, gradientes de título |
| `--aero-teal` | `#00C9A7` | Acentos Frutiger Aero, glow, bordes de paneles "acuosos", chroma-halo falso |
| `--aero-lime` | `#B4F461` | Highlights, sparkles, el sapo, estados "on air" |
| `--y2k-magenta` | `#FF3EA5` | Gags, alertas exageradas, texto de impacto, hover chillón |
| `--y2k-purple` | `#7B2FF7` | Gradientes con magenta/teal, fondos de gags, sombras "duras" de color |
| `--y2k-red` | `#FF2E2E` | Acento de Mots, carteles tipo "VIRUS DETECTED", errores falsos, VS del debate |
| `--chrome-silver` | `#D9E4EC` | Superficies de ventana/panel (cuerpo de XPWindow), botones biselados |
| `--warning-yellow` | `#FFE135` | Alertas falsas, cinta de peligro, zócalo de noticiero, parpadeos |
| `--bg-cloud-white` | `#F4F9FF` | Fondo base tipo cielo XP, texto sobre oscuro |
| `--crt-black` | `#0D0D0D` | Scanlines, vignette, texto principal sobre claro, fondos de glitch |
| `--skin-light` | `#F2C49B` | Tono de piel de avatares (Chavez, Darbolis) — espejo en `config/members.ts` |
| `--skin-tan` | `#D99A6C` | Tono de piel de avatares (Aym, Krilin) |
| `--skin-brown` | `#9C6B43` | Tono de piel de avatares (Mots) |
| `--obs-key-magenta` | `#FF00FF` | **RESERVADO — no es un color de diseño.** Es el color llave del filtro Color Key de OBS: pinta los agujeros de cámara en modo `?cams=real` (ver ARCHITECTURE.md). Cualquier píxel de este color exacto se vuelve transparente en el stream, así que jamás usarlo en un componente. No confundir con `--y2k-magenta` |

Cada miembro además tiene un **color de acento asignado** (definido en `client/src/config/members.ts`, único lugar): Aym = `--xp-blue-bright` (azul), Darbolis = `--y2k-purple` (morado), Mots = `--y2k-red` (rojo), Krilin = `--y2k-magenta` (rosado), Chavez = `--aero-lime` (verde). Ese también es el **orden oficial** del programa (el orden de claves de `MEMBERS` define `MEMBER_IDS`; grillas, strips y créditos lo heredan). Usar ese color para su remera 3D, su chip del panel y su nametag en layouts.

Excepción de paleta documentada: el layout Lección usa un fondo **verde pizarrón** propio (`#2a6b4f → #143528`, en `Leccion.css`) porque ningún verde de la paleta funciona como pizarrón; no usarlo fuera de ese contexto.

Decisión documentada: el chat (`FakeChat`) va sobre fondo **oscuro** (`--crt-black`, texto `--bg-cloud-white`, nicks default en lima/magenta) — los colores de nick que manda Kick están pensados para su tema oscuro y sobre blanco no se leían.

## Paletas (re-tematizado en vivo — `client/src/styles/themes.css`)

El productor puede cambiar la paleta del overlay en vivo (evento `set-palette`, selector en el panel): `themes.css` overridea los tokens de la tabla de arriba bajo `[data-palette="<id>"]` en `<html>` (lo aplica `OverlayApp`). La default es la paleta de la tabla, sin atributo. Alternativas:

| Id | Idea | Carácter |
|---|---|---|
| `vaporwave` | Atardecer de Miami pirateado | Rosa `#FF71CE` / cian `#01F9C6` / violeta noche `#16082E` |
| `xp-luna` | Tema oliva clásico de Windows XP | Verdes/olivas `#73A842`, plata beige `#ECE9D8` |
| `crt` | Terminal de fósforo verde | Todo verde sobre `#020A02`, acentos en lima/amarillo |

Reglas:
- `--obs-key-magenta` **jamás** se overridea (es el color llave del Color Key).
- Los `--skin-*` tampoco (espejo de `members.ts`).
- Límite conocido: los colores que viven en **JS** (acentos de miembros en `members.ts`, materiales 3D de avatares) no cambian con la paleta — solo se re-tematiza el escenario CSS.
- Toda paleta nueva se agrega en `themes.css` + `PALETTES` (`useOverlayStore.ts`) y se documenta en esta tabla.

## Tipografías (Google Fonts, cargadas en `client/index.html`)

| Contexto | Fuente | Variable CSS |
|---|---|---|
| Títulos / impacto (zócalos, BREAKING, YA VOLVEMOS) | **Rubik Mono One** (primaria), **Bungee** (alternativa cuando Rubik Mono One queda muy rígida) | `--font-impact`, `--font-impact-alt` |
| Cuerpo informal / gags / chat falso | **Comic Neue** | `--font-comic` |
| Chrome de "sistema operativo" (barras de título, botones de ventana, panel del productor) | **Tahoma**, fallback Trebuchet MS → Verdana | `--font-system` |
| Acentos pixelados puntuales (contadores, tickers, labels chicos) — **no** para bloques largos | **Silkscreen** (labels), **VT323** (números/terminal) | `--font-pixel`, `--font-terminal` |
| Mano alzada / Paint (nametags, títulos "escritos", eslogan, badges) | **Gochi Hand** (fallback Patrick Hand) | `--font-hand` |

## Escala de espaciado y tamaños

No hay grid estricto (sería demasiado prolijo), pero como base: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 16px`, `--space-4: 32px`. Está permitido (y bienvenido) desviarse ±3px para que las cosas queden "un toque corridas".

## Efectos reusables (clases en `client/src/styles/retro-utils.css`)

| Clase / recurso | Qué hace | Cómo se implementa |
|---|---|---|
| `.bevel-out` / `.bevel-in` | Bisel Windows 98/XP saliente/hundido | doble `box-shadow` inset claro/oscuro |
| `.scanlines` | Overlay CRT sutil (pseudo-elemento `::after`) — **desactivada por rendimiento** (ver "Suciedad global") | `repeating-linear-gradient` semitransparente, hoy `content: none` |
| `.chroma-text` | Aberración cromática en texto | `text-shadow` offset rojo/cian |
| `.chroma-hover` | Aberración cromática solo en hover | ídem, en `:hover` |
| `.wobble-border` | Borde irregular "dibujado a mano" | `filter: url(#wobble)` — filtro SVG `feTurbulence` + `feDisplacementMap` definido una sola vez en `WobbleFilterDefs` (`client/src/overlay/chrome/WobbleFilterDefs.tsx`). **No** generar clip-paths a mano por componente. |
| `.marquee` + `.marquee-inner` | Texto scrolleando | CSS `@keyframes`, nunca el tag `<marquee>` |
| `.cursor-retro` | Cursor mano/flecha retro | `cursor: url(data-uri svg), auto` |
| `.danger-tape` | Cinta de peligro amarilla/negra | `repeating-linear-gradient` 45° |
| `.gradient-kazaa` / `.gradient-aero` / `.gradient-gag` | Gradientes predefinidos de 3-4 colores en ángulo raro | `linear-gradient` |
| `.sparkle` | GIF-feel de brillitos | animación CSS de opacidad/escala escalonada |

## Paint / mano alzada

Segunda capa estética sumada en Etapa 2: trazos tipo MS Paint sobre la base Y2K/XP.

| Recurso | Qué hace | Cómo se implementa |
|---|---|---|
| `.scribble-border` | Borde crayón (intensidad moderada, scale 7) | filtro SVG `#scribble` en `WobbleFilterDefs`. **Solo sobre capas de fondo/borde** — nunca sobre un elemento que contenga texto o canvas, los vuelve ilegibles. Patrón: capa `position: absolute; inset: 0` con el filtro detrás del contenido (ver `MemberBadge`). |
| `.sticker` | Contorno blanco grueso tipo sticker recortado + sombra dura | cadena de `drop-shadow` |
| `.hand-underline` | Subrayado ondulado "a mano" | SVG data-uri repetible en `background-image` |
| `Doodles.tsx` (`DoodleArrow/Star/Squiggle/Circle`) | Garabatos SVG sueltos para decorar layouts | paths temblorosos, `stroke-linecap: round`, grosor 5-6, color de paleta via prop |
| `Caritas.tsx` (`Carita member=...`) | Carita MS Paint de cada miembro (2D, no gasta WebGL) | SVG inline, piel/pelo de `members.ts`, trazos `--crt-black`. **Sin filtros adentro**: `.sticker` lo pone el consumidor donde las reglas de rendimiento lo permitan. Espejo del arte de marca (`branding/src/caritas.svg`) — retocar ambos. Usos: nametag de `CamCell`, sello del `MemberBadge`, créditos del Outro |

Criterio: los doodles se posicionan desde el CSS del layout (clases `.mi-layout__doodle-*`), rotados en ángulos raros. Los nametags y títulos "escritos por alguien" van en `--font-hand`; los títulos "de sistema/broadcast" siguen en `--font-impact`.

### Filtros y rendimiento (regla dura)

Los filtros con `url()` (`#wobble`, `#scribble`) y las cadenas de `drop-shadow` (`.sticker`) son carísimos si el navegador los re-rasteriza cada frame. Reglas:

- **Nunca** combinar un filtro con una animación de `transform` en el **mismo elemento**: el transform animado va en un wrapper y el filtro en un hijo estático (ver `CHBug`: `.ch-bug-sway` anima, `.ch-bug` lleva el wobble). Así el filtro rasteriza una vez y el movimiento es compositing puro.
- **Nunca** aplicar un filtro a un elemento cuyo subtree contenga un `<canvas>` 3D vivo: cada frame del canvas re-ejecuta el filtro. El filtro va en capas de fondo estáticas (ver `MemberBadge`).
- `.sticker` y `.scribble-border` son ambos `filter:` — en el mismo elemento uno pisa al otro; si hacen falta los dos, van en dos capas anidadas (ver `MemberBadge`: `__bg-wrap` sticker + `__bg` scribble).

## Suciedad global

**DESACTIVADA por rendimiento** (decisión de producción): la PC del productor corre el overlay junto a OBS y 5 fuentes NDI, y cualquier capa a pantalla completa con `mix-blend-mode` obliga a componer todo el viewport en cada frame. Quedaron desactivados:

- **`DirtOverlay`** (`chrome/DirtOverlay.tsx`) — ya no lo monta `OverlayApp`. El componente sigue en el repo (grano animado, viñeta, manchas, pelo de VHS) por si algún día sobra GPU.
- **Scanlines** — `.scanlines::after` está anulado en `retro-utils.css` (`content: none`); la clase sigue puesta en los layouts para poder revivirla sin tocar 17 archivos.

Si se reactivan, va con veto del productor y medición antes/después. La mugre que SÍ queda (barata, rasteriza una vez): sombras internas desparejas de `XPWindow`/`CamCell` (`::after` con box-shadow "manoseado"), `.smudge-frame`, stickers, wobble/scribble sobre capas estáticas y doodles. **El panel del productor NO lleva nada de esto** — es una herramienta, se mantiene legible.

## Motion (Framer Motion)

Definido en `client/src/overlay/motionPresets.ts` — **usar estos presets, no inventar curvas por componente**:

- `SPRING_TORPE` — `{ type: 'spring', stiffness: 550, damping: 14, mass: 1.1 }` → overshoot exagerado, rebote visible. Default para entradas de layouts y paneles.
- `CORTE_BRUSCO` — `{ duration: 0.12, ease: [0.9, 0, 1, 0.1] }` → casi un corte seco. Para salidas y glitches.
- `REBOTE_ZOCALO` — `{ type: 'spring', stiffness: 300, damping: 9 }` → entra desde el costado y rebota de más. Para zócalos/banners.
- Duraciones: entradas 0.3–0.6s con overshoot; salidas ≤0.15s (brusco). Nunca `ease: 'easeInOut'` suave.
- **Cortinilla de layouts** (`chrome/LayoutCurtain`): 100% opaca en todo momento (nada de alpha: pasa sobre agujeros magenta) y cada variante tiene su propia animación de entrada/salida — la única regla común es cubrir todo el viewport antes de `CURTAIN_IN_MS`. Variantes: **teatro pixelado** (dos hojas plisadas que se cierran desde los costados; movimiento cuantizado en 6 saltos con un easing custom estilo 16 bits, y pliegues de stops duros en tonos `color-mix` sobre `--y2k-red` — derivación de paleta documentada, como la excepción del pizarrón), **panel Kazaa** con el logo CH (baja desde arriba, sale como CRT apagándose: se aplasta a una línea y colapsa — nunca se desliza al salir), y **señal perdida** (reusa el visual del gag `GlitchInterrupt` vía `GlitchScreen`; entra y sale con corte seco de duración 0). Los timings del ciclo viven en el store (`CURTAIN_*_MS`), no en el componente.

## Low-poly 3D (Three.js / R3F)

- **Siempre** montar 3D con **`RetroCanvas`** (`client/src/three/RetroCanvas.tsx`), nunca `<Canvas>` directo. Fija `dpr=1` (OBS sale a 1920×1080 con dpr 1 igual; el pixelado extra en previews hidpi es parte del look), `frameloop="demand"` con muestreo a **~24fps** y `gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}`. El movimiento 3D medio stop-motion a 24fps es **estética declarada** (mismo lenguaje que los `steps()` de CSS), no un bug; la prop `fps` existe pero subirla necesita justificación.
- **Siempre** `flatShading: true` en todos los materiales.
- Geometrías simples con pocas subdivisiones: `icosahedronGeometry` (detail 0), `coneGeometry` (≤8 segmentos), `octahedronGeometry`, `torusGeometry` (≤10 segmentos).
- Luces duras: una `directionalLight` intensa + `ambientLight` baja. Sin sombras suaves.
- Colores de materiales: solo de la paleta (+ tonos `--skin-*` y colores de pelo definidos en `config/members.ts`).

### Avatares de la plebe (`client/src/three/avatars/`)

- Un archivo por miembro (`AvatarChavez.tsx`, etc.), **solo primitivas** (box, icosahedron detail ≤1, cone ≤8 seg, torus, cylinder), `flatShading: true` en todo.
- Partes faciales compartidas en `avatars/parts.tsx` (`Eyes`, `Glasses`, `Mouth`).
- El rasgo distintivo de cada uno es ley: Chavez cabeza cuadrada+lentes+gordito, Aym cabeza ovalada+nariz ancha, Mots piel morena+cerquillo, Darbolis flaco+granos+lentes+cerquillo partido, Krilin pelo largo+nariz grande.
- `Avatar3D` agrega la idle animation (bob + vaivén, con `bobOffset` para desincronizar; la amplitud del bob escala con el avatar); `AvatarBust` es el canvas chico tipo PFP para UI 2D — máximo UNO simultáneo, para filas/columnas usar `AvatarRow`/`AvatarColumn` (ver COMPONENT_PATTERNS.md).
