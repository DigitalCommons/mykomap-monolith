import { screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./utils/test-utils";

// TODO: enable this once we work out how to mock viewport width
// test("App should have correct initial render on desktop", () => {
//   window.innerWidth = 1200;
//   fireEvent(window, new Event("resize"));

//   renderWithProviders(<App />);

//   expect(screen.getByLabelText("Open panel")).toBeInTheDocument();
// });

test("App should have correct initial render on mobile", () => {
  renderWithProviders(<App />);

  expect(screen.getByText("Search")).toBeInTheDocument();
});

// test("Increment value and Decrement value should work as expected", async () => {
//   const { user } = renderWithProviders(<App />)

//   // Click on "+" => Count should be 1
//   await user.click(screen.getByLabelText("Increment value"))
//   expect(screen.getByLabelText("Count")).toHaveTextContent("1")

//   // Click on "-" => Count should be 0
//   await user.click(screen.getByLabelText("Decrement value"))
//   expect(screen.getByLabelText("Count")).toHaveTextContent("0")
// })
