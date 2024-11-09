import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import DirectoryItem from "./DirectoryItem";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../theme/theme";
import GlobalCSSVariables from "../../../../theme/GlobalCSSVariables";

// Simulate a click event on a link
const clickInteraction = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const link = await canvas.getByRole("button");
  await userEvent.click(link);
};

const meta = {
  title: "Components/Panel/DirectoryItem",
  component: DirectoryItem,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalCSSVariables />
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" }, // This action will log the event
  },
  args: {
    link: "javascript:void(0)", // Prevent navigation by using this link
  },
  parameters: {
    layout: "centered",
    actions: {
      handles: ["click a"],
    },
  },
} as Meta<typeof DirectoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Directory Item",
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      console.log("Link clicked"); // Log the event to show it's working
    },
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};
