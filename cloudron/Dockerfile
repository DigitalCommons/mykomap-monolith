# Cloudron app image for MykoMaps
#
# Build the BE and FE then assemble an image on the Cloudron base
# Caddy (on port 8000) serves the FE and reverse proxies /api/*
#  to the BE on localhost:3000
#
# Build from the repo root:
#
#     docker build -f cloudron/Dockerfile -t mykomap .
#
# FE settings are written to config.js from env vars but can be edited there

# Node version, should match .tool-versions
ARG NODE_VERSION=22.4.1

# Caddy version, pinned, update for new releases
ARG CADDY_VERSION=2.11

# Debian (not Alpine) so the node binary can be copied into cloudron/base
FROM node:${NODE_VERSION} AS build

# Same-origin API and root base path, fixed by the Caddyfile
ENV VITE_API_URL=/api
ENV VITE_BASE_URL=/

WORKDIR /srv/src
COPY . .

RUN npm ci && \
    npm run -w @mykomap/back-end build && \
    npm run -w @mykomap/front-end build

FROM caddy:${CADDY_VERSION}-alpine AS caddy

# The image we keep
FROM cloudron/base:5.1.0

COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=caddy /usr/bin/caddy /usr/local/bin/caddy

COPY --from=build /srv/src/apps/back-end/package.json /srv/src/apps/back-end/dist/ /app/code/back-end/
COPY --from=build /srv/src/apps/front-end/dist/ /app/code/front-end/
COPY cloudron/start.sh cloudron/Caddyfile /app/code/

RUN chmod +x /app/code/start.sh

# BE config
# /app/data is the Cloudron localstorage volume datasets come from
# /app/data/datasets/<dataset-id>/ is where each dataset is stored
ENV NODE_ENV=production
ENV FASTIFY_PORT=3000
ENV FASTIFY_ADDRESS=127.0.0.1
ENV API_PATH_PREFIX=/api
ENV SERVER_DATA_ROOT=/app/data
# Let node use most of the 1GB memory limit
ENV NODE_OPTIONS=--max-old-space-size=768

# Caddy must not write - filesystem is read only
ENV XDG_CONFIG_HOME=/run/caddy/config
ENV XDG_DATA_HOME=/run/caddy/data

WORKDIR /app/code

CMD [ "/app/code/start.sh" ]
