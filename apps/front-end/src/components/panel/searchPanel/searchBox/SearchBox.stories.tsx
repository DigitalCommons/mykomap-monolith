import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import SearchBox from "./SearchBox";
import { userEvent, within } from "@storybook/test";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../theme/theme";
import GlobalCSSVariables from "../../../../theme/GlobalCSSVariables";

// Simulate a click event on the button
const clickInteraction = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const button = await canvas.getByRole("button");
  await userEvent.click(button);
};

const meta = {
  title: "SearchBox",
  component: SearchBox,
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
} as Meta<typeof SearchBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    value: "",
    onChange: fn(),
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};

export const WithValue: Story = {
  args: {
    value: "Search",
    onChange: fn(),
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};

export const WithButtonAction: Story = {
  args: {
    value: "",
    onChange: fn(),
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};

export const WithValueAndButtonAction: Story = {
  args: {
    value: "Search",
    onChange: fn(),
  },
  play: ({ canvasElement }) => clickInteraction(canvasElement),
};
