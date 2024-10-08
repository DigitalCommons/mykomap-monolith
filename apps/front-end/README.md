# Mykomap front-end app

- A React-Redux app build with Vite
- Written in Typescript
- Map rendered using MapLibre Gl JS
- Uses a ts-rest fetch client to interact with the Mykomap API

## Scripts

- `start` - Start dev server. This serves both the front- and back-end
  apps together, with HMR. You may wish to set the .env variable
  `SERVER_DATA_ROOT` (e.g. to `test/data`) in order for the back-end
  to find suitable data.
- `dev` - Start dev server and open browser. This only serves the
  front-end app, with HMR. The back-end `dev` command needs to be run separately.
- `build` - Build for production
- `preview` - Locally preview production build. This serves the
  front-end app only.
- `test` - Launch test runner
