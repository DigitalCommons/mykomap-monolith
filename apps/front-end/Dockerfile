## syntax=docker/dockerfile:1

# Builds the FE with Node, then serves the static files with Caddy.
# Caddy proxies /api/* to the BE (see Caddyfile) and serves /config.js
#  which docker-entrypoint.sh creates from environment variables
#  when the container starts so one image works for every environment
#
# Build from the repo root:
#  docker build -f apps/front-end/Dockerfile --build-arg NODE_VERSION=22 -t mykomap-front-end .

# Get Node version externally, e.g. 22.4.1
# We need to supply a default as we can't mandate this is set
ARG NODE_VERSION=nonesuch

# Caddy version pinned, update this for new releases
ARG CADDY_VERSION=2.11

# Use this node image for building
FROM node:${NODE_VERSION}-alpine AS build

# Where the API is, baked into the bundle by VITE and matches the Caddyfile
ARG API_URL=/api
# Where the app is served from - same as above
ARG BASE_URL=/
ENV VITE_API_URL=${API_URL?}
ENV VITE_BASE_URL=${BASE_URL?}

# The commit being built, set by Coolify. The version itself comes from
#  CHANGELOG.md so the build needs no git checkout
ARG SOURCE_COMMIT=
ENV SOURCE_COMMIT=${SOURCE_COMMIT}

# Copy the source in
# .dockerignore excludes node_modules and dist
COPY .  /srv/src

# Use a cache mount to /root/.npm to speed up subsequent builds.
RUN --mount=type=cache,target=/root/.npm <<SCRIPT
set -e
cd /srv/src
npm ci
cd apps/front-end/
npm run build

SCRIPT


# This is the image we'll keep
FROM caddy:${CADDY_VERSION}-alpine

# Where /api/* is proxied to
# Coolify PR previews rename the back-end service to back-end-pr-N so the
#  compose file overrides this from SERVICE_NAME_BACK_END
ENV API_UPSTREAM=back-end:3000

COPY --from=build /srv/src/apps/front-end/dist/ /usr/share/caddy/
COPY apps/front-end/Caddyfile /etc/caddy/Caddyfile
COPY apps/front-end/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
