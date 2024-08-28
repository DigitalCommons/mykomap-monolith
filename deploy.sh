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
#   - DBUS_SESSION_BUS_ADDRESS: required for service management
# - the back-end deploys a PM2 config $DEPLOY_DEST/back-end/ecosystem.config.js for `pm2 start`
# - FIXME the user can write to DEPLOY_DEST, WWW_ROOT
#   - or else, the proxy pass and WWW roots have been defined already
#
# We don't assume a terminal or any interactivity.


FE_DEST=$DEPLOY_DEST/front-end
BE_DEST=$DEPLOY_DEST/back-end
DATA_DEST=$DEPLOY_DEST/data
PM2_VERSION="^5.4"
SYSTEMD_UNIT="$USERDIR/.config/systemd/user/pm2.service"
[[ -z "$DBUS_SESSION_BUS_ADDRESS" ]] && {
  die "no user session found? DBUS_SESSION_BUS_ADDRESS unset."
}

mkdir -vp "${DEPLOY_DEST:?}"


mkdir -vp "${FE_DEST}" "${BE_DEST}" "${DATA_DEST}"


# update asdf installations, using .tool-versions file
asdf plugin add nodejs || true
asdf install

# FIXME if nodejs is updated, need to restart pm2
#  pm2 unstartup pm2 startup

# Install pm2 compatible with 5.4 (being fairly specific deliberately)
# asdf will shim this so it works
npm install -g "pm2@$PM2_VERSION"

# Install systemd unit
mkdir -p "${SYSTEMD_UNIT%/*}"
cat >"$SYSTEMD_UNIT" <<EOF
[Unit]
Description=PM2 process manager for %u
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=%h/.pm2
Environment=ASDF_DIR=/opt/asdf
PIDFile=%h/.pm2/pm2.pid
Restart=on-failure
WorkingDirectory=$BE_DEST
ExecStart=bash -c '. "$ASDF_DIR/asdf.sh" && pm2 startOrReload ecosystem.config.json'
ExecReload=bash -c '. "$ASDF_DIR/asdf.sh" && pm2 reload all'
ExecStop=bash -c '. "$ASDF_DIR/asdf.sh" && pm2 kill'

[Install]
WantedBy=default.target
EOF

# Keep ASDF happy when running in DEPLOY_DEST
cp .tool-versions "$DEPLOY_DEST"

( # Front end
  cd apps/front-end
  npm ci
  rm -rf dist/
  npm run build
  #npm deploy "$FE_DEST"
  cp -a --copy-contents dist/. "$FE_DEST" # the . is significant
)
( # back end
  cd apps/back-end
  npm ci
  rm -rf dist/
  npm run build
  # npm deploy "$BE_DEST"
  cp -a --copy-contents dist/. "$BE_DEST" # the . is significant
  cat >"$BE_DEST/.env" <<EOF
SERVER_DATA_ROOT=$DATA_DEST
FASTIFY_PORT=$PROXY_PORT
#   root address?
EOF

  (
    cd "$BE_DEST"
    pm2 flush
    pm2 startOrReload ecosystem.config.json
    
    # FIXME Do we need to pm2 save?
  )
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
  systemctl --user enable pm2
  systemctl --user start pm2
)
