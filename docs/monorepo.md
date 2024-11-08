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
  |- @mykomap/config, a folder for each dataset containing:
      |- config.json ... includes vocabs, item prop specs, UI config
```

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
