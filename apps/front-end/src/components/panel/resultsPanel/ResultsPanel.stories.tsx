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
      onLinkClick(link.getAttribute("href") || "unknown"); // Trigger the onLinkClick action
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
    onLinkClick: { action: "linkClicked" }, // Action for link clicks
    onTogglePanel: { action: "panelToggled" }, // Action for toggling the panel
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
    onLinkClick: (link: string) => {
      console.log(`Link clicked: ${link}`);
    },
    onTogglePanel: (isOpen: boolean) => {
      console.log(`Panel toggled: ${isOpen}`);
    },
  },
};
