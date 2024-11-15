import "@testing-library/jest-dom/vitest";

// Creating a maplibre-gl map instance doesn't work in tests due to WebGL issues, so mock the
// constructor
vi.mock("maplibre-gl", () => ({
  Map: vi.fn().mockImplementation((options) => ({
    on: vi.fn(),
    remove: vi.fn(),
    fire: vi.fn(),
  })),
}));
