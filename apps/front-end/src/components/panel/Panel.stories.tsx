import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import GlobalCSSVariables from "../../theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import Panel from "./Panel";
import { store } from "../../app/store";
import { Provider } from "react-redux";

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

// Helper function to switch tabs and attach listeners
const clickInteraction = async (canvasElement: HTMLElement, args: any) => {
  const canvas = within(canvasElement);

  // Click the "Directory" tab to show DirectoryPanel
  const directoryTab = await canvas.getByRole("tab", { name: /Directory/i });
  await userEvent.click(directoryTab);

  // Attach event listeners to prevent navigation
  await attachLinkClickListeners(canvasElement, args.onLinkClick);
};

const meta: Meta<typeof Panel> = {
  title: "Components/Panel/MainPanel",
  component: Panel,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onTabChange: { action: "tabChanged" }, // Action for tab switching
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
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: any;
  }) => {
    const canvas = within(canvasElement);

    // Initially click on "Directory" tab to show DirectoryPanel
    await clickInteraction(canvasElement, args);

    // Now simulate switching to another tab and back to Directory
    const searchTab = await canvas.getByRole("tab", { name: /Search/i });
    await userEvent.click(searchTab);
    args.onTabChange(1);

    // Switch back to Directory tab
    const directoryTab = await canvas.getByRole("tab", { name: /Directory/i });
    await userEvent.click(directoryTab);
    args.onTabChange(0);

    // Re-apply the link click listeners when the Directory tab is re-selected
    await attachLinkClickListeners(canvasElement, args.onLinkClick);
  },
  args: {
    onTabChange: (tabIndex: number) => {
      console.log(`Tab changed to ${tabIndex}`);
    },
    onLinkClick: (link: string) => {
      console.log(`Link clicked: ${link}`);
    },
    onTogglePanel: (isOpen: boolean) => {
      console.log(`Panel toggled: ${isOpen}`);
    },
  },
};
