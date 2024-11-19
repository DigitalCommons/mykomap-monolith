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
