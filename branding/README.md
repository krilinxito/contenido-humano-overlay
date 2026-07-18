# branding/ — Arte de marca Contenido Humano

Arte estático para las cuentas (perfil + banners), con la misma paleta, tipografías
y criterio de `docs/DESIGN_SYSTEM.md`. No toca `client/` ni `server/`.

## Piezas (`out/`)

| Archivo | Dimensiones | Uso |
|---|---|---|
| `logo-ch-1080.png` | 1080×1080 | Foto de perfil IG / YouTube / Kick. Todo lo crítico dentro del círculo inscrito (las 3 plataformas recortan en círculo). |
| `banner-youtube-2560x1440.png` | 2560×1440 | Banner de canal YouTube. Lo crítico vive en la **zona segura centrada de 1546×423** (lo único visible en desktop); el resto es decoración sacrificable. |
| `banner-kick-1920x1080.png` | 1920×1080 | Banner de canal Kick. Composición propia, no un resize del de YT. |
| `anuncio-1080.png` | 1080×1080 | Post cuadrado de anuncio de stream (fecha + hora Bolivia + horarios equivalentes en ventanita XP). Para el siguiente stream editar `.fecha`, `.hora` y la lista `.tz` en `src/anuncio.html`. |

Pendiente: la URL `kick.com/contenidohumano` es placeholder — confirmar el handle
real en `src/banner-kick.html` y `src/anuncio.html` (`.url`).

## Cómo se genera

Cada pieza es un HTML (`src/*.html`) del tamaño exacto del lienzo, renderizado con
**firefox headless** a PNG:

```bash
./export.sh          # todo
./export.sh logo     # una pieza: logo | youtube | kick | anuncio
```

- `src/shared.css` — espejo manual de la paleta/tipos del design system + réplica
  del CHBug (`.ch-logo`, escalable con `--ch-scale`).
- `src/caritas.svg` — las 5 caras MS Paint como `<symbol>` (colores skin/hair de
  `client/src/config/members.ts`, rasgo de ley de cada uno). **Espejo client**:
  `client/src/overlay/chrome/Caritas.tsx` porta el mismo dibujo al overlay —
  si se retoca una cara, retocar ambos. Los HTML las usan vía
  `<use href="caritas.svg#cara-...">`; por eso `export.sh` setea
  `security.fileuri.strict_origin_policy=false` en un perfil descartable (sin eso
  firefox bloquea `<use>` externo entre archivos `file://`).
- `fonts/` — woff2 (subset latin) bajados de Google Fonts para render offline.

Cualquier retoque: editar el HTML/SVG, correr `export.sh` y listo.
