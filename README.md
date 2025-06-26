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
