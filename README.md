![build and test status](https://github.com/DigitalCommons/mykomap-monolith/actions/workflows/node-build-test.yml/badge.svg)

# Mykomap Mono-Repo

Mono-repo home to the FE/BE applications and libraries comprising Mykomap.

See the full technical documentation [here](https://digitalcommons.github.io/mykomap-monolith/).

## Applications

- [Front-end](./apps/front-end/)
- [Back-end](./apps/back-end/)

## Libraries

- [Common](./libs/common/), which contains the OpenAPI spec and ts-rest contract.

## How to install a dependency

```
npm i <package> -w <workspace name> --save
```

e.g.

```
npm i @fastify/cors -w @mykomap/back-end --save
```

## Installation

See [deployment docs](https://digitalcommons.github.io/mykomap-monolith/deployment/).

## Quick Local Set-up

There are 4 codebases and 1 data source to setup. Follow the order as written here.

Note: users on windows will need to use WSL as some of the build steps are unix-like.

### Data

1. Download data by cloning this repository: https://github.com/DigitalCommons/cwm-test-data 
1. Navigate into the directory and do `git checkout dev` to use the dev branch of the data
1. Note the path to the datasets directory from the Mykomap directory because you'll need this later for the back-end .env file

### Node Utils & Common Types

1. `cd libs/node-utils`
1. `npm ci`
1. `npm build`
1. `cd ../common`
1. `npm ci`
1. `npm build`

### Back-end

1. `cd apps/back-end`
1. Copy .env file contents from BitWarden under Mykomap Back End .env Variables. The values in Bitwarden assume that you created `cwm-test-data` in a directory next to `mykomap-monolith`. If you did something different update the SERVER_DATA_ROOT env variable.
1. Create `.env` next to `.env.example`
1. `npm ci`
1. `npm run dev`

### Front-end

1. `cd apps/front-end`
1. Copy .env file contents from BitWarden under Mykomap Front End .env Variables
1. Create `.env` next to `.env.example`
1. `npm ci`
1. `npm run dev`

Navigate to `localhost:5173/?datasetId=cwm-latest` in the browser to see the map. Replace `cwm-latest` with `powys-eng` or any other dataset name from the `cwm-test-data` repo to see it on the map.
