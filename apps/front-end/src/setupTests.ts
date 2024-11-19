import "@testing-library/jest-dom/vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Creating a maplibre-gl map instance doesn't work in tests due to WebGL issues, so mock the
// constructor
vi.mock("maplibre-gl", () => ({
  Map: vi.fn().mockImplementation((options) => ({
    on: vi.fn(),
    remove: vi.fn(),
    fire: vi.fn(),
  })),
}));

// Mock i18next hook so it just uses the key as the translation
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock network requests
const server = setupServer(
  http.get("/api/version", ({ request, params }) => {
    return HttpResponse.json({
      name: "test-api",
      buildTime: "2024-11-19T11:33:27.825Z",
      version: [0],
      commitDesc: "abc123",
      nodeEnv: "development",
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
