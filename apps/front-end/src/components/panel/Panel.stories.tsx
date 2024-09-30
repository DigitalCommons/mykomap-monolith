import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import GlobalCSSVariables from "../../theme/GlobalCSSVariables";
import Panel from "./Panel";


const meta: Meta<typeof Panel> = {
  title: "Components/Panel",
  component: Panel,
  parameters: {
    layout: "fullscreen", 
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click to open the panel
    const openButton = await canvas.getByRole("button");
    await userEvent.click(openButton);
    
    // Wait and then close the panel
    await userEvent.click(openButton);
  },
};