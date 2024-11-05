import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import GlobalCSSVariables from "../../../theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import { store } from "../../../app/store";
import { Provider } from "react-redux";
import ResultsPanel from "./ResultsPanel";

// Helper function to prevent link navigation and handle clicks
const attachLinkClickListeners = async (
  canvasElement: HTMLElement,
  onLinkClick: (link: string) => void,
) => {
  const canvas = within(canvasElement);
  const links = await canvas.getAllByRole("link");

  // Prevent default behavior for all links
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      onLinkClick(link.getAttribute("href") || "clicked"); // Trigger the onLinkClick action
    });
  });

  // Simulate clicking the first link for testing
  if (links.length > 0) {
    await userEvent.click(links[0]);
  }
};

const meta: Meta<typeof ResultsPanel> = {
  title: "Components/Panel/ResultsPanel",
  component: ResultsPanel,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onLinkClick: { action: "linkClicked" }, // Captures clicks on links in the Actions panel
    onTogglePanel: { action: "panelToggled" }, // Captures panel toggling
    onClearSearch: { action: "clearSearch" }, // Captures clearing of search
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <GlobalCSSVariables />
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </Provider>
    ),
  ],
  tags: ["components", "resultsPanel", "autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // No need for manual console logs since the Storybook action handlers will capture these
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Attach click listeners to links
    await attachLinkClickListeners(canvasElement, args.onLinkClick);

    // Test clear search button
    const clearSearchButton = await canvas.getByText("Clear Search");
    await userEvent.click(clearSearchButton);
    args.onClearSearch(); // Captured by Storybook's Actions panel

    // Test panel toggle button
    let toggleButton;

    // Try to find the button with "Open panel" label first
    try {
      toggleButton = await canvas.getByLabelText(/open panel/i);
    } catch {
      // If not found, try with "Close panel"
      toggleButton = await canvas.getByLabelText(/close panel/i);
    }

    await userEvent.click(toggleButton);
    args.onTogglePanel(true); // Captured by Storybook's Actions panel
  },
};
