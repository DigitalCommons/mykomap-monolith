## syntax=docker/dockerfile:1

# Useful hints used here:
# https://adambrodziak.pl/dockerfile-good-practices-for-node-and-npm

# Get Node version externally, e.g. 22.4.1
# We need to supply a default as we can't mandate this is set
ARG NODE_VERSION=nonesuch

# Use this node image for building
FROM node:${NODE_VERSION}-alpine AS build

# Copy source in. Note, .dockerignore should exclude node_modules and dist dirs
COPY .  /srv/src

# Download dependencies as a separate step to take advantage of Docker's caching.
# Use a cache mount to /root/.npm to speed up subsequent builds.
# Use a bind mount to access the source code
RUN --mount=type=cache,target=/root/.npm <<SCRIPT
set -e

# Git is needed for the build info
apk add git

cd /srv/src
npm ci
cd apps/back-end/
npm run build

SCRIPT

# This is the image we'll keep
FROM node:${NODE_VERSION}-alpine

WORKDIR /app/

# Use these values by default. They can be overridden in the docker compose file.
ENV NODE_ENV=production
ENV FASTIFY_PORT=3000
ENV FASTIFY_ADDRESS=0.0.0.0
ENV API_PATH_PREFIX=/api
ENV SERVER_DATA_ROOT=/data

# Copy the built application files from the build image into this image.
COPY --from=build /srv/src/apps/back-end/package.json /srv/src/apps/back-end/dist/ .

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE ${FASTIFY_PORT}

# Run the application.
CMD node server.js
