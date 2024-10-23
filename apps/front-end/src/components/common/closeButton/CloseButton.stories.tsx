import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import CloseButton from "./CloseButton";
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
  title: "Components/Common/CloseButton",
  component: CloseButton,
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
} as Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CloseButtonStory: Story = {
  args: {
    buttonAction: () => console.log("Close button clicked"),
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};
