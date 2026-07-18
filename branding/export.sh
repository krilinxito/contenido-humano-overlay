#!/usr/bin/env bash
# Exporta el arte de marca a PNG con firefox headless.
# Uso: ./export.sh [logo|youtube|kick|anuncio]  (sin args exporta todo)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out

# Perfil descartable: sin él firefox headless choca con la instancia abierta.
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
# Permite que los HTML file:// referencien caritas.svg vía <use href> externo.
{
  echo 'user_pref("privacy.file_unique_origin", false);'
  echo 'user_pref("security.fileuri.strict_origin_policy", false);'
} > "$PROFILE/user.js"

shot() {
  local src="$1" out="$2" size="$3"
  firefox --headless --profile "$PROFILE" --no-remote \
    --screenshot "$PWD/out/$out" \
    --window-size="$size" "file://$PWD/src/$src" 2>/dev/null
  magick identify "out/$out"
}

case "${1:-all}" in
  logo)    shot logo.html logo-ch-1080.png 1080,1080 ;;
  youtube) shot banner-youtube.html banner-youtube-2560x1440.png 2560,1440 ;;
  kick)    shot banner-kick.html banner-kick-1920x1080.png 1920,1080 ;;
  anuncio) shot anuncio.html anuncio-1080.png 1080,1080 ;;
  all)
    shot logo.html logo-ch-1080.png 1080,1080
    shot banner-youtube.html banner-youtube-2560x1440.png 2560,1440
    shot banner-kick.html banner-kick-1920x1080.png 1920,1080
    shot anuncio.html anuncio-1080.png 1080,1080
    ;;
esac
