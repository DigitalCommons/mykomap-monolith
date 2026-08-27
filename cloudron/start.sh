#!/bin/bash

# Cloudron startup script. Runs as root. Prepares /app/data for datasets
#  then runs the BE and Caddy as the unprivileged cloudron user.
#
# If the BE or FE (through Caddy) exit then so does the script and Cloudron
#  will restart the app.


set -eu

# Datasets live here
mkdir -p /app/data/datasets
chown -R cloudron:cloudron /app/data

mkdir -p /run/caddy/config /run/caddy/data /run/mykomap

# FE settings from the env vars, served as /config.js
# See apps/front-end/public/config.js for explanations of each var
node -e '
  const keys = ["MAPTILER_API_KEY", "GLITCHTIP_KEY", "UMAMI_URL", "UMAMI_ID",
    "UMAMI_RECORDER_URL", "MIXPANEL_TOKEN", "MIXPANEL_SESSION_RECORDING_PERCENT"];
  const config = Object.fromEntries(keys.map((k) => [k, process.env[k] ?? ""]));
  console.log("window.MYKOMAP_CONFIG = " + JSON.stringify(config, null, 2) + ";");
' > /run/mykomap/config.js
chown -R cloudron:cloudron /run/caddy /run/mykomap

echo "-> Starting MykoMaps back-end"
gosu cloudron:cloudron node /app/code/back-end/server.js &

echo "-> Starting Caddy"
gosu cloudron:cloudron caddy run --config /app/code/Caddyfile --adapter caddyfile &

wait -n
echo "-> A service exited, stopping app" >&2
exit 1
