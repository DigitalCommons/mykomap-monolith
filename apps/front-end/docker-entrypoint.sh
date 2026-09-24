#!/bin/sh
# Writes the front-end runtime settings to /config.js from environment
# variables, then starts Caddy. See apps/front-end/public/config.js for
# what each setting does. Unset variables are written as empty strings,
# which the app treats as unset.
set -eu

mkdir -p /run/mykomap
{
  echo "window.MYKOMAP_CONFIG = {"
  for key in MAPTILER_API_KEY GLITCHTIP_KEY DEPLOYMENT_ENVIRONMENT UMAMI_URL UMAMI_ID \
    UMAMI_RECORDER_URL MIXPANEL_TOKEN MIXPANEL_SESSION_RECORDING_PERCENT; do
    eval "value=\${$key:-}"
    # Escape for a double quoted JavaScript string
    value=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    echo "  $key: \"$value\","
  done
  echo "};"
} > /run/mykomap/config.js

exec "$@"
