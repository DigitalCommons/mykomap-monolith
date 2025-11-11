import { screen, waitFor } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./utils/test-utils";

// TODO: we can maybe get rid of this UT once we have better playwright visual regression tests

// TODO: enable this once we work out how to mock viewport width
// test("App should have correct initial render on desktop", () => {
//   window.innerWidth = 1200;
//   fireEvent(window, new Event("resize"));

//   renderWithProviders(<App />);

//   expect(screen.getByLabelText("Open panel")).toBeInTheDocument();
// });

test("App should have correct initial render on mobile", () => {
  renderWithProviders(<App />);

  waitFor(() => {
    expect(screen.getByText("search")).toBeInTheDocument();
  });
});
