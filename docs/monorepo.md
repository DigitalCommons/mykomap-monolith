# Monorepo structure

```
monorepo
|- apps
  |- @mykomap/front-end
  |- @mykomap/back-end
      |- Dataset class instance for each dataset that needs a deployed backend
      |- single ts-rest/Fastify server shared across all datasets
      |- script to generate data for each dataset, consumed by the back-end server
|- libs
  |- @mykomap/common
      |- API ts-rest contract + OpenAPI spec
      |- prop defs code (used by both front-end and back-end)
  |- @mykomap/node-utils
      |- common code that relies on the NodeJS runtime e.g. file utilities
```

## Dependencies

The build order, set in the `build` runscript of the root `package.json` is:

1. `libs/common`
2. `libs/node-utils`
3. `apps/back-end`
4. `apps/front-end`

This is because there is some common code used to label the builds,
defined in a file `build-info.ts`. This ensures the labelling is
generated in a consistent way in all the modules.

Where does this code go? This gets complicated, as some modules are by
design free of NodeJS dependencies, and since those are transitory,
`libs/common` cannot have runtime NodeJS dependent
dependencies. (Although, it _does_ have `devDependencies` on
`node-utils`, because the tests it uses `file-utils.ts` defined
there).

However: the `build-info.ts` code necessarily needs to run
`git-depend` to obtain information about the build, if only at build
time.

Which means:

- The `build-info.ts` code common to all modules needs to be in the
  first module to compile.
- This module cannot be in `node-utils`, or else `common` and
  `front-end` cannot use it.
- As `node-utils` needs the `build-info.ts` code too, at runtime and
  build time, therefore it must depend on `common` rather than vice
  versa.

Other modules can then depend on `common` to get the `build-info.ts`
code, and only need to pull in the `spawnSync` function from NodeJS in
their `vite.config.ts` files, so the node dependency is only implicit
and at build time.

## Ideas

- Use monorepo manager (e.g. Nx, Turborepo) to manage builds
- Use git subtree, so we can publish sub-folders of the monorepo as independent repos that others
  can use. We can set this up later if required, but for now try to ensure repositories are not
  tightly coupled unecessarily.
- Differentiate between maps and datasets: currently a map's data and config is associated with a
  single dataset on the backend. We may want to unlink these so that 2 maps can share the same
  dataset with differnet config, or a map can show multiple datasets. This could be done in the
  future.
- Allow back-end code to be imported into the front-end for map builds that don't need a separate
  back-end.
