# vite-template-redux

Uses [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), and [React Testing Library](https://github.com/testing-library/react-testing-library) to create a modern [React](https://react.dev/) app compatible with [Create React App](https://create-react-app.dev/)

```sh
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```

## Goals

- Easy migration from Create React App or Vite
- As beginner friendly as Create React App
- Optimized performance compared to Create React App
- Customizable without ejecting

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

## Inspiration

- [Create React App](https://github.com/facebook/create-react-app/tree/main/packages/cra-template)
- [Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react)
- [Vitest](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib)
