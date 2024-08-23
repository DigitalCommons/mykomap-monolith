# Monorepo thinking

```
monorepo
|- apps
  |- frontend
  |- backend
      |- Map class instance for each config that needs a deployed backend
      |- Single Hapi server shared across all maps
|- packages
  |- initiative-filter library for search/filter(imported in BE and some FE builds)
  |- shared types
  |- Swagger API specs
  |- map-configs, a folder for each map containing:
      |- config.js ... includes flag for whether to use search/filter in FE or BE
      |- json files
      |- CSVs
```

## Ideas
- Use pnpm workspaces to define and share dependencies https://dev.to/lico/react-monorepo-setup-tutorial-with-pnpm-and-vite-react-project-ui-utils-5705
- Use git subtree, so we can publish sub-folders of the monorepo as independent repos that others can use?
