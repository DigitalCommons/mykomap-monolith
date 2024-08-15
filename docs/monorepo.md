# Monorepo thinking

```
monorepo
|- frontend
   |- shared mykomap package
   |- all map configs in separate folders
     |- config.js ... includes flag for whether to use search/filter in FE or BE
     |- json files
     |- csvs
|- backend
|- shared types (API definitions)
|- search/filter code (imported in FE and BE)
```

pnpm workspaces https://dev.to/lico/react-monorepo-setup-tutorial-with-pnpm-and-vite-react-project-ui-utils-5705

## Ideas
- Use git subtree, so we can publish sub-folders of the monorepo as independent repos that others can use?
