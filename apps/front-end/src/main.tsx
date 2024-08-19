import React from "react"
import * as Sentry from "@sentry/browser"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import App from "./App"
import { store } from "./app/store"
import "./index.css"

// Initialise Sentry SDK ASAP before application load and React initialisation.
//
// The key in the DSN needs to be defined in the .env (or .env.*) files, that are loaded
// by Vite via the dotenv library. https://vitejs.dev/guide/env-and-mode
Sentry.init({ dsn: `https://${import.meta.env.VITE_GLITCHTIP_KEY}@app.glitchtip.com/7707` })

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
