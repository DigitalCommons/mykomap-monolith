import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import DirectoryPanel from "./DirectoryPanel";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import GlobalCSSVariables from "../../../theme/GlobalCSSVariables";

// Simulate a click event on a link within the DirectoryPanel
const clickInteraction = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const links = await canvas.getAllByRole("button"); // Get all links in the panel

  links.forEach((link) => {
    link.addEventListener("click", (e) => e.preventDefault()); // Prevent navigation for all links
  });

  // Simulate clicking on the first link, for example
  await userEvent.click(links[0]);
};

const meta = {
  title: "Components/Panel/DirectoryPanel",
  component: DirectoryPanel,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalCSSVariables />
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    actions: {
      handles: ["click a"],
    },
  },
} as Meta<typeof DirectoryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};
