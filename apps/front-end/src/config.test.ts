import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// config.ts reads window.MYKOMAP_CONFIG when it is imported, so each test
// sets the runtime config first and imports a fresh copy of the module.
const load = async () => (await import("./config")).config;

describe("runtime config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete window.MYKOMAP_CONFIG;
    vi.unstubAllEnvs();
  });

  it("takes the GlitchTip environment from config.js", async () => {
    window.MYKOMAP_CONFIG = { DEPLOYMENT_ENVIRONMENT: "staging" };
    expect((await load()).deploymentEnvironment).toBe("staging");
  });

  it("falls back to the build variable when config.js leaves it empty", async () => {
    vi.stubEnv("VITE_DEPLOYMENT_ENVIRONMENT", "dev");
    window.MYKOMAP_CONFIG = { DEPLOYMENT_ENVIRONMENT: "" };
    expect((await load()).deploymentEnvironment).toBe("dev");
  });

  it("is empty when neither is set", async () => {
    expect((await load()).deploymentEnvironment).toBe("");
  });
});
