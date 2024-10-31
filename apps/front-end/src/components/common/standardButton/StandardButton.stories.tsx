import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import StandardButton from "./StandardButton";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import GlobalCSSVariables from "../../../theme/GlobalCSSVariables";

// Simulate a click event on the button
const clickInteraction = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const button = await canvas.getByRole("button");
  await userEvent.click(button);
};

const meta = {
  title: "Common/StandardButton",
  component: StandardButton,
  parameters: {
    layout: "centered",
  },
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
    onClick: { action: "clicked" },
  },
  args: { onClick: fn() },
} as Meta<typeof StandardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: "primary",
    children: "Primary Button",
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    children: "Secondary Button",
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};

export const DisabledPrimary: Story = {
  args: {
    color: "primary",
    children: "Disabled Primary Button",
    disabled: true,
  },
};
