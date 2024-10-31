// PopUp Story

import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import GlobalCSSVariables from "../../theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import PopUp from "./PopUp";

const meta = {
  title: "Common/PopUp",
  component: PopUp,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalCSSVariables />
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "closed" },
  },
  args: { open: true }, // Set default open state to true
} as Meta<typeof PopUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
  },
};
