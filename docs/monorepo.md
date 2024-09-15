# Monorepo thinking

```
monorepo
|- apps
  |- @mykomap/front-end
  |- @mykomap/back-end
      |- Map class instance for each config that needs a deployed backend
      |- Single Fastify server shared across all maps
|- libs
  |- @mykomap/common
      |- search/filter code (imported in BE and some FE builds)
      |- API ts-rest contract + OpenAPI spec
  |- @mykomap/variants, a folder for each map containing:
      |- config.ts ... includes flag for whether to use search/filter in FE or BE
      |- popup.ts (with an aim to commonalise this code and configure within config.ts)
```

## Ideas

- Use monorepo manager (e.g. Nx, Turborepo) to manage builds
- Use git subtree, so we can publish sub-folders of the monorepo as independent repos that others
  can use. We can set this up later if required, but for now try to ensure repositories are not
  tightly coupled unecessarily.
