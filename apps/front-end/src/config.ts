// FE runtime configuration
//
// Values come from config.js - see apps/front-end/public/config.js
// This allows a container to have its own version of the config
// Every value falls back to the VITE_* build variable for .env
// backwards compatibility

export interface RuntimeConfig {
  MAPTILER_API_KEY?: string;
  GLITCHTIP_KEY?: string;
  UMAMI_URL?: string;
  UMAMI_ID?: string;
  UMAMI_RECORDER_URL?: string;
  MIXPANEL_TOKEN?: string;
  MIXPANEL_SESSION_RECORDING_PERCENT?: string;
}

declare global {
  interface Window {
    MYKOMAP_CONFIG?: RuntimeConfig;
  }
}

const runtime: RuntimeConfig = window.MYKOMAP_CONFIG ?? {};

// Empty strings count as unset - so a config.js can have "" to use the fallbacks
const pick = (runtimeValue?: string, buildValue?: string): string =>
  runtimeValue || buildValue || "";

export const config = {
  maptilerApiKey: pick(
    runtime.MAPTILER_API_KEY,
    import.meta.env.VITE_MAPTILER_API_KEY,
  ),
  glitchtipKey: pick(runtime.GLITCHTIP_KEY, import.meta.env.VITE_GLITCHTIP_KEY),
  umamiUrl: pick(runtime.UMAMI_URL, import.meta.env.VITE_UMAMI_URL),
  umamiRecorderUrl: runtime.UMAMI_RECORDER_URL ?? "",
  umamiId: pick(runtime.UMAMI_ID, import.meta.env.VITE_UMAMI_ID),
  mixpanelToken: pick(
    runtime.MIXPANEL_TOKEN,
    import.meta.env.VITE_MIXPANEL_TOKEN,
  ),
  mixpanelSessionRecordingPercent: Number(
    pick(
      runtime.MIXPANEL_SESSION_RECORDING_PERCENT,
      import.meta.env.VITE_MIXPANEL_SESSION_RECORDING_PERCENT,
    ),
  ),
};

// Umami's tracker is injected here so it can be changed at runtime
export const loadUmami = () => {
  if (!config.umamiUrl || !config.umamiId) return;
  const add = (src: string) => {
    const script = document.createElement("script");
    script.defer = true;
    script.src = src;
    script.dataset.websiteId = config.umamiId;
    document.head.appendChild(script);
  };
  add(config.umamiUrl);
  // Optional session recorder (heatmaps and replays), same website id
  if (config.umamiRecorderUrl) add(config.umamiRecorderUrl);
};
