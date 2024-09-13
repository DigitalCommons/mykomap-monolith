import React from "react";
import * as Sentry from "@sentry/browser";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./app/store";
import "./index.css";
import { ThemeProvider } from "@mui/material/styles";
import GlobalCSSVariables from "./theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import theme from "./theme/theme";

// Initialise Sentry SDK ASAP before application load and React initialisation.
//
// The key in the DSN needs to be defined in the .env (or .env.*) files, that are loaded
// by Vite via the dotenv library. https://vitejs.dev/guide/env-and-mode
Sentry.init({
  dsn: `https://${import.meta.env.VITE_GLITCHTIP_KEY}@app.glitchtip.com/7707`,

  // Use Vite's concept of mode to set the environment for Glitchtip
  // (Mode != NODE_ENV, see https://vitejs.dev/guide/env-and-mode#modes)
  environment: import.meta.env.MODE,

  // Enable automatic instrumentation
  integrations: [Sentry.browserTracingIntegration()],

  // Use finer control of sent transactions in development mode.
  tracesSampleRate: import.meta.env.MODE == "development" ? 1.0 : 0,
});

const container = document.getElementById("root");
// eslint-disable-next-line no-import-assign
// const theme = createTheme({ cssVariables: true });

if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <GlobalCSSVariables />
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Provider>
    </React.StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  );
}
