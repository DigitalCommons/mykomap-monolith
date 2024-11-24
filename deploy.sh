#!/bin/bash 

set -o errexit
set -o pipefail
set -vx

# build a deployment package from a git repository

# We assume that
# - this script is in the repository which has been checked out into a working directory
# - there is a .tool-versions file present for asdf
# - the following tools are installed and on the path
#   - asdf in /opt/asdf
#   - node/npm (possibly via asdf)
# - user-mode systemd is possible, and the user has the "linger-mode" enabled
# - it is running as the user which will run the service, with a dbus session
# - the following environment variables
#   - DEPLOY_DEST
#   - WWW_ROOT # not used if not writing proxy/path config
#   - USERDIR: the current user's home directory
#   - PROXY_PORT: the port number being proxied (e.g. '4000')
#   - PROXY_PATH: the path being proxied (e.g. '/api')
#   - BASE_URL_PATH # not actually used but might be in future?
#   - FE_GLITCHTIP_KEY
#   - BE_GLITCHTIP_KEY
#   - MAPTILER_API_KEY
#   - DBUS_SESSION_BUS_ADDRESS: required for service management
# - FIXME the user can write to DEPLOY_DEST, WWW_ROOT
#   - or else, the proxy pass and WWW roots have been defined already
#
# We don't assume a terminal or any interactivity.

FE_DEST=$DEPLOY_DEST/front-end
#BE_DEST=$DEPLOY_DEST/back-end
BE_DEST=$PWD/apps/back-end # work around build glitches by running from source!
DATA_DEST=$DEPLOY_DEST/data
SYSTEMD_UNIT="$USERDIR/.config/systemd/user/mykomap-backend.service"
[[ -z "$DBUS_SESSION_BUS_ADDRESS" ]] && {
  echo "no user session found? DBUS_SESSION_BUS_ADDRESS unset."
  exit 1
}

mkdir -vp "${DEPLOY_DEST:?}"


mkdir -vp "${FE_DEST}" "${BE_DEST}" "${DATA_DEST}"


# update asdf installations, using .tool-versions file
asdf plugin add nodejs || true
asdf install

# Install systemd unit
mkdir -p "${SYSTEMD_UNIT%/*}"
cat >"$SYSTEMD_UNIT" <<EOF
[Unit]
Description=Mykomap back-end process manager for %u
Documentation=https://github.com/DigitalCommons/mykomap-monolith/
After=network.target

[Service]
Type=exec
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=ASDF_DIR=/opt/asdf
EnvironmentFile=$BE_DEST/.env
Restart=on-failure
WorkingDirectory=$BE_DEST
ExecStart=bash -c '. "$ASDF_DIR/asdf.sh" && npm run start:attached'
ExecReload=kill -HUP \$MAINPID

[Install]
WantedBy=default.target
EOF

# Keep ASDF happy when running in DEPLOY_DEST
cp .tool-versions "$DEPLOY_DEST"

( # Front end
  cd apps/front-end
  npm ci
  rm -rf dist/

  echo >.env
  chmod 0600 .env # ensure secrets are secret-ish
  # FIXME these shouldn't be hardwired!
  cat >>.env <<EOF
VITE_API_URL=/api
VITE_GLITCHTIP_KEY=${FE_GLITCHTIP_KEY:?}
VITE_MAPTILER_API_KEY=${MAPTILER_API_KEY:?}
EOF
  
  npm run build
  #npm deploy "$FE_DEST"
  #cp -a --copy-contents dist/. "$FE_DEST" # the . is significant
)
( # back end
  cd apps/back-end
  npm ci
  rm -rf dist/
  npm run build 
  # npm deploy "$BE_DEST"
  # cp -a --copy-contents dist/. "$BE_DEST" # the . is significant

  echo >"$BE_DEST/.env"
  chmod 0600 "$BE_DEST/.env" # ensure secrets are secret-ish  
  cat >>"$BE_DEST/.env" <<EOF
SERVER_DATA_ROOT=$DATA_DEST
FASTIFY_PORT=$PROXY_PORT
GLITCHTIP_KEY=${BE_GLITCHTIP_KEY:?}
#   root address?
EOF
  
)

# FIXME this needs perms! And root user ownership. Delegate to caller for now.
false && {
  WWW_DOCROOT="${WWW_ROOT:?}/www"
  PROXY_CONF="${WWW_ROOT:?}/custom.conf"
  ln -sfn "$WWW_DOCROOT" "$FE_DEST"
  cat >"$PROXY_CONF" <<EOF
ProxyPass $PROXY_PATH http://localhost:$PROXY_PORT
ProxyPassReverse $PROXY_PATH http://localhost:$PROXY_PORT
EOF
}

( # This needs a user session, which this script should have been started with.
  systemctl --user daemon-reload # loads any new configs
  systemctl --user enable mykomap-backend
  systemctl --user is-active --quiet mykomap-backend && systemctl --user restart mykomap-backend # if already running, restart
  systemctl --user start mykomap-backend
)
